import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { Venta, EstadoVenta, MetodoPago } from './entities/venta.entity';
import { VentaDetalle } from './entities/venta-detalle.entity';
import { Producto } from '../productos/entities/producto.entity';
import { Cliente } from '../clientes/entities/cliente.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Promocion } from '../promociones/entities/promocion.entity';

@Injectable()
export class VentasService {
  constructor(
    @InjectRepository(Venta)
    private ventaRepository: Repository<Venta>,
    @InjectRepository(VentaDetalle)
    private ventaDetalleRepository: Repository<VentaDetalle>,
    @InjectRepository(Producto)
    private productoRepository: Repository<Producto>,
    @InjectRepository(Cliente)
    private clienteRepository: Repository<Cliente>,
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    @InjectRepository(Promocion)
    private promocionRepository: Repository<Promocion>,
    private dataSource: DataSource,
  ) {}

  async create(createVentaDto: CreateVentaDto): Promise<Venta> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validar usuario
      const usuario = await this.usuarioRepository.findOne({
        where: { id: createVentaDto.usuarioId, isActive: true }
      });
      if (!usuario) {
        throw new NotFoundException('Usuario no encontrado');
      }

      // Validar cliente si se proporciona
      let cliente = null;
      if (createVentaDto.clienteId) {
        cliente = await this.clienteRepository.findOne({
          where: { id: createVentaDto.clienteId, isActive: true }
        });
        if (!cliente) {
          throw new NotFoundException('Cliente no encontrado');
        }
      }

      // Validar productos y stock
      const productosValidados = [];
      for (const detalle of createVentaDto.detalles) {
        const producto = await this.productoRepository.findOne({
          where: { id: detalle.productoId, isActive: true }
        });
        if (!producto) {
          throw new NotFoundException(`Producto ${detalle.productoId} no encontrado`);
        }
        if (producto.stock < detalle.cantidad) {
          throw new BadRequestException(`Stock insuficiente para ${producto.nombre}`);
        }
        productosValidados.push({ producto, detalle });
      }

      // Crear la venta
      const venta = this.ventaRepository.create({
        clienteId: createVentaDto.clienteId,
        vendedorId: createVentaDto.usuarioId,
        metodoPago: createVentaDto.metodoPago,
        estado: createVentaDto.estado || EstadoVenta.PENDIENTE,
        numeroVenta: this.generarNumeroVenta(),
        fechaVenta: new Date(),
        subtotal: 0, // Se calculará después
        totalDescuentos: createVentaDto.descuentoAdicional || 0,
        total: 0, // Se calculará después
        puntosGenerados: 0, // Se calculará después
        costoDelivery: createVentaDto.delivery?.costoDelivery || 0,
        direccionEntrega: createVentaDto.delivery?.direccion,
      });

      const ventaGuardada = await queryRunner.manager.save(venta) as Venta;

      // Crear detalles y actualizar stock
      let subtotal = 0;
      let totalDescuentos = 0;
      let puntosGenerados = 0;

      for (const { producto, detalle } of productosValidados) {
        // Validar promoción si aplica
        let promocion = null;
        if (detalle.promocionId) {
          promocion = await this.promocionRepository.findOne({
            where: { id: detalle.promocionId, isActive: true }
          });
        }

        const ventaDetalle = this.ventaDetalleRepository.create({
          ventaId: ventaGuardada.id,
          productoId: producto.id,
          cantidad: detalle.cantidad,
          precioUnitario: detalle.precioUnitario,
          descuento: detalle.descuento || 0,
          subtotal: detalle.cantidad * detalle.precioUnitario,
        });

        await queryRunner.manager.save(ventaDetalle);

        // Actualizar stock
        producto.stock -= detalle.cantidad;
        producto.totalVendido += detalle.cantidad;
        await queryRunner.manager.save(producto);

        // Calcular totales
        const subtotalDetalle = detalle.cantidad * detalle.precioUnitario;
        subtotal += subtotalDetalle;
        totalDescuentos += detalle.descuento || 0;

        // Calcular puntos si el producto los habilita
        if (producto.habilitaPuntos && !producto.esBonificado) {
          puntosGenerados += Math.floor(subtotalDetalle);
        }
      }

      // Actualizar totales de la venta
      ventaGuardada.subtotal = subtotal;
      ventaGuardada.totalDescuentos = totalDescuentos + (createVentaDto.descuentoAdicional || 0);
      ventaGuardada.total = subtotal - ventaGuardada.totalDescuentos + (createVentaDto.delivery?.costoDelivery || 0);
      ventaGuardada.puntosGenerados = puntosGenerados;
      ventaGuardada.estado = EstadoVenta.COMPLETADA;

      await queryRunner.manager.save(ventaGuardada);

      // Actualizar puntos del cliente si aplica
      if (cliente && puntosGenerados > 0) {
        cliente.puntosAcumulados += puntosGenerados;
        cliente.montoTotalCompras += ventaGuardada.total;
        await queryRunner.manager.save(cliente);
      }

      await queryRunner.commitTransaction();

      return this.findOne(ventaGuardada.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(page: number = 1, limit: number = 10, filters?: any): Promise<{ data: Venta[], total: number }> {
    const queryBuilder = this.ventaRepository.createQueryBuilder('venta')
      .leftJoinAndSelect('venta.cliente', 'cliente')
      .leftJoinAndSelect('venta.usuario', 'usuario')
      .leftJoinAndSelect('venta.detalles', 'detalles')
      .leftJoinAndSelect('detalles.producto', 'producto')
      .where('venta.isActive = :isActive', { isActive: true });

    // Aplicar filtros
    if (filters?.estado) {
      queryBuilder.andWhere('venta.estado = :estado', { estado: filters.estado });
    }
    if (filters?.metodoPago) {
      queryBuilder.andWhere('venta.metodoPago = :metodoPago', { metodoPago: filters.metodoPago });
    }
    if (filters?.fechaInicio) {
      queryBuilder.andWhere('venta.createdAt >= :fechaInicio', { fechaInicio: filters.fechaInicio });
    }
    if (filters?.fechaFin) {
      queryBuilder.andWhere('venta.createdAt <= :fechaFin', { fechaFin: filters.fechaFin });
    }
    if (filters?.clienteId) {
      queryBuilder.andWhere('venta.clienteId = :clienteId', { clienteId: filters.clienteId });
    }
    if (filters?.usuarioId) {
      queryBuilder.andWhere('venta.usuarioId = :usuarioId', { usuarioId: filters.usuarioId });
    }

    queryBuilder
      .orderBy('venta.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total };
  }

  async findOne(id: string): Promise<Venta> {
    const venta = await this.ventaRepository.findOne({
      where: { id, isActive: true },
      relations: [
        'cliente',
        'usuario',
        'detalles',
        'detalles.producto',
        'detalles.promocion'
      ],
    });

    if (!venta) {
      throw new NotFoundException('Venta no encontrada');
    }

    return venta;
  }

  async update(id: string, updateVentaDto: UpdateVentaDto): Promise<Venta> {
    const venta = await this.findOne(id);

    // Solo permitir actualizar ciertos campos después de creada
    const camposPermitidos = ['estado', 'observaciones', 'motivo'];
    const datosActualizacion = {};

    for (const campo of camposPermitidos) {
      if (updateVentaDto[campo] !== undefined) {
        datosActualizacion[campo] = updateVentaDto[campo];
      }
    }

    await this.ventaRepository.update(id, datosActualizacion);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const venta = await this.findOne(id);
    
    if (venta.estado === EstadoVenta.COMPLETADA) {
      throw new BadRequestException('No se puede eliminar una venta completada');
    }

    await this.ventaRepository.update(id, { isActive: false });
  }

  async getVentasPorPeriodo(fechaInicio: Date, fechaFin: Date): Promise<any> {
    const queryBuilder = this.ventaRepository.createQueryBuilder('venta')
      .select([
        'DATE(venta.createdAt) as fecha',
        'COUNT(*) as totalVentas',
        'SUM(venta.total) as totalIngresos',
        'AVG(venta.total) as promedioVenta'
      ])
      .where('venta.isActive = :isActive', { isActive: true })
      .andWhere('venta.estado = :estado', { estado: EstadoVenta.COMPLETADA })
      .andWhere('venta.createdAt >= :fechaInicio', { fechaInicio })
      .andWhere('venta.createdAt <= :fechaFin', { fechaFin })
      .groupBy('DATE(venta.createdAt)')
      .orderBy('fecha', 'ASC');

    return await queryBuilder.getRawMany();
  }

  async getProductosMasVendidos(limit: number = 10): Promise<any> {
    const queryBuilder = this.ventaDetalleRepository.createQueryBuilder('detalle')
      .leftJoinAndSelect('detalle.producto', 'producto')
      .leftJoinAndSelect('detalle.venta', 'venta')
      .select([
        'producto.id',
        'producto.nombre',
        'producto.codigo',
        'SUM(detalle.cantidad) as totalVendido',
        'SUM(detalle.subtotal) as totalIngresos'
      ])
      .where('venta.isActive = :isActive', { isActive: true })
      .andWhere('venta.estado = :estado', { estado: EstadoVenta.COMPLETADA })
      .groupBy('producto.id')
      .orderBy('totalVendido', 'DESC')
      .limit(limit);

    return await queryBuilder.getRawMany();
  }

  async getTicketsActivos(usuarioId: string): Promise<any[]> {
    const tickets = await this.ventaRepository.find({
      where: {
        vendedorId: usuarioId,
        estado: EstadoVenta.PENDIENTE,
        isActive: true
      },
      relations: ['detalles', 'detalles.producto'],
      order: { createdAt: 'DESC' }
    });

    return tickets;
  }

  async crearTicket(usuarioId: string, ticketId: string): Promise<{ ticketId: string }> {
    // Validar que el usuario existe
    const usuario = await this.usuarioRepository.findOne({
      where: { id: usuarioId, isActive: true }
    });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return { ticketId };
  }

  private generarNumeroVenta(): string {
    const fecha = new Date();
    const año = fecha.getFullYear().toString().slice(-2);
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const dia = fecha.getDate().toString().padStart(2, '0');
    const timestamp = Date.now().toString().slice(-6);
    
    return `V${año}${mes}${dia}${timestamp}`;
  }
}
