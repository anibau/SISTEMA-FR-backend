import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { Promocion, PromocionUso, EstadoPromocion, TipoPromocion } from './entities/promocion.entity';
import { CreatePromocionDto } from './dto/create-promocion.dto';
import { UpdatePromocionDto } from './dto/update-promocion.dto';
import { AplicarPromocionDto, ValidarPromocionDto } from './dto/aplicar-promocion.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class PromocionesService {
  constructor(
    @InjectRepository(Promocion)
    private promocionRepository: Repository<Promocion>,
    @InjectRepository(PromocionUso)
    private promocionUsoRepository: Repository<PromocionUso>,
  ) {}

  async create(createPromocionDto: CreatePromocionDto, usuarioId?: string): Promise<Promocion> {
    // Verificar que no exista una promoción con el mismo código
    const existingPromocion = await this.promocionRepository.findOne({
      where: { codigo: createPromocionDto.codigo },
    });

    if (existingPromocion) {
      throw new ConflictException('Ya existe una promoción con este código');
    }

    // Validar fechas
    if (new Date(createPromocionDto.fechaInicio) >= new Date(createPromocionDto.fechaFin)) {
      throw new BadRequestException('La fecha de inicio debe ser anterior a la fecha de fin');
    }

    // Validar configuración según tipo
    this.validarConfiguracionPromocion(createPromocionDto);

    const promocion = this.promocionRepository.create({
      ...createPromocionDto,
      creadoPor: usuarioId,
    });

    return await this.promocionRepository.save(promocion);
  }

  async findAll(paginationDto: PaginationDto): Promise<{
    data: Promocion[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [promociones, total] = await this.promocionRepository.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['usos'],
    });

    return {
      data: promociones,
      total,
      page,
      limit,
    };
  }

  async findActivas(): Promise<Promocion[]> {
    const ahora = new Date();
    
    return await this.promocionRepository.find({
      where: {
        estado: EstadoPromocion.ACTIVA,
        fechaInicio: Between(new Date('1900-01-01'), ahora),
        fechaFin: Between(ahora, new Date('2100-12-31')),
        isActive: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findByTipo(tipo: TipoPromocion): Promise<Promocion[]> {
    return await this.promocionRepository.find({
      where: {
        tipo,
        estado: EstadoPromocion.ACTIVA,
        isActive: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Promocion> {
    const promocion = await this.promocionRepository.findOne({
      where: { id, isActive: true },
      relations: ['usos'],
    });

    if (!promocion) {
      throw new NotFoundException('Promoción no encontrada');
    }

    return promocion;
  }

  async findByCodigo(codigo: string): Promise<Promocion> {
    const promocion = await this.promocionRepository.findOne({
      where: { codigo, isActive: true },
      relations: ['usos'],
    });

    if (!promocion) {
      throw new NotFoundException('Promoción no encontrada');
    }

    return promocion;
  }

  async update(id: string, updatePromocionDto: UpdatePromocionDto): Promise<Promocion> {
    const promocion = await this.findOne(id);

    // Validar configuración si se está actualizando
    if (updatePromocionDto.tipo || updatePromocionDto.descuentoPorcentaje || updatePromocionDto.descuentoMonto) {
      this.validarConfiguracionPromocion({ ...promocion, ...updatePromocionDto });
    }

    Object.assign(promocion, updatePromocionDto);
    return await this.promocionRepository.save(promocion);
  }

  async remove(id: string): Promise<void> {
    const promocion = await this.findOne(id);
    promocion.isActive = false;
    promocion.estado = EstadoPromocion.INACTIVA;
    await this.promocionRepository.save(promocion);
  }

  async activar(id: string): Promise<Promocion> {
    const promocion = await this.findOne(id);
    promocion.estado = EstadoPromocion.ACTIVA;
    return await this.promocionRepository.save(promocion);
  }

  async desactivar(id: string): Promise<Promocion> {
    const promocion = await this.findOne(id);
    promocion.estado = EstadoPromocion.INACTIVA;
    return await this.promocionRepository.save(promocion);
  }

  async pausar(id: string): Promise<Promocion> {
    const promocion = await this.findOne(id);
    promocion.estado = EstadoPromocion.PAUSADA;
    return await this.promocionRepository.save(promocion);
  }

  async validarPromocion(validarDto: ValidarPromocionDto): Promise<{
    valida: boolean;
    promocion?: Promocion;
    descuento?: number;
    mensaje?: string;
  }> {
    try {
      const promocion = await this.findByCodigo(validarDto.codigo);

      if (!promocion.estaVigente) {
        return {
          valida: false,
          mensaje: 'La promoción no está vigente o ha expirado',
        };
      }

      // Verificar uso por cliente si se proporciona
      if (validarDto.clienteId) {
        const usosCliente = await this.promocionUsoRepository.count({
          where: {
            promocionId: promocion.id,
            clienteId: validarDto.clienteId,
          },
        });

        if (!promocion.puedeUsarCliente(validarDto.clienteId, usosCliente)) {
          return {
            valida: false,
            mensaje: 'Has alcanzado el límite de uso de esta promoción',
          };
        }
      }

      // Calcular descuento si se proporciona monto
      let descuento = 0;
      if (validarDto.montoTotal) {
        descuento = promocion.calcularDescuento(
          validarDto.montoTotal,
          validarDto.cantidadTotal
        );
      }

      return {
        valida: true,
        promocion,
        descuento,
        mensaje: 'Promoción válida',
      };
    } catch (error) {
      return {
        valida: false,
        mensaje: error.message,
      };
    }
  }

  async aplicarPromocion(aplicarDto: AplicarPromocionDto): Promise<{
    aplicada: boolean;
    descuentoTotal: number;
    promocion: Promocion;
    detalles: any[];
    mensaje?: string;
  }> {
    const promocion = await this.findOne(aplicarDto.promocionId);

    if (!promocion.estaVigente) {
      throw new BadRequestException('La promoción no está vigente');
    }

    // Verificar código promocional si se requiere
    if (promocion.requiereCodigoPromocional) {
      if (!aplicarDto.codigoPromocional || aplicarDto.codigoPromocional !== promocion.codigoPromocional) {
        throw new BadRequestException('Código promocional inválido');
      }
    }

    // Verificar tipo de venta
    if (aplicarDto.tipoVenta === 'delivery' && !promocion.aplicaEnDelivery) {
      throw new BadRequestException('Esta promoción no aplica para delivery');
    }
    if (aplicarDto.tipoVenta === 'mostrador' && !promocion.aplicaEnMostrador) {
      throw new BadRequestException('Esta promoción no aplica para ventas en mostrador');
    }

    // Verificar uso por cliente
    if (aplicarDto.clienteId) {
      const usosCliente = await this.promocionUsoRepository.count({
        where: {
          promocionId: promocion.id,
          clienteId: aplicarDto.clienteId,
        },
      });

      if (!promocion.puedeUsarCliente(aplicarDto.clienteId, usosCliente)) {
        throw new BadRequestException('Has alcanzado el límite de uso de esta promoción');
      }
    }

    // Filtrar productos aplicables
    const productosAplicables = this.filtrarProductosAplicables(aplicarDto.productos, promocion);

    if (productosAplicables.length === 0) {
      throw new BadRequestException('Ningún producto es elegible para esta promoción');
    }

    // Calcular descuentos
    const detalles = [];
    let descuentoTotal = 0;

    for (const producto of productosAplicables) {
      const subtotal = producto.precio * producto.cantidad;
      const descuentoProducto = promocion.calcularDescuento(subtotal, producto.cantidad);
      
      if (descuentoProducto > 0) {
        detalles.push({
          productoId: producto.productoId,
          cantidad: producto.cantidad,
          precio: producto.precio,
          subtotal,
          descuento: descuentoProducto,
        });
        descuentoTotal += descuentoProducto;
      }
    }

    // Verificar monto mínimo total
    const montoTotal = aplicarDto.productos.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
    if (promocion.montoMinimo && montoTotal < promocion.montoMinimo) {
      throw new BadRequestException(`Monto mínimo requerido: S/ ${promocion.montoMinimo}`);
    }

    // Verificar cantidad mínima total
    const cantidadTotal = aplicarDto.productos.reduce((sum, p) => sum + p.cantidad, 0);
    if (promocion.cantidadMinima && cantidadTotal < promocion.cantidadMinima) {
      throw new BadRequestException(`Cantidad mínima requerida: ${promocion.cantidadMinima} productos`);
    }

    return {
      aplicada: true,
      descuentoTotal,
      promocion,
      detalles,
      mensaje: 'Promoción aplicada exitosamente',
    };
  }

  async registrarUsoPromocion(
    promocionId: string,
    ventaId: string,
    montoDescuento: number,
    clienteId?: string,
    codigoUsado?: string,
  ): Promise<PromocionUso> {
    const promocion = await this.findOne(promocionId);

    // Registrar uso en la promoción
    promocion.registrarUso(ventaId, clienteId, montoDescuento);
    await this.promocionRepository.save(promocion);

    // Crear registro de uso
    const uso = this.promocionUsoRepository.create({
      promocionId,
      ventaId,
      clienteId,
      montoDescuento,
      codigoUsado,
    });

    return await this.promocionUsoRepository.save(uso);
  }

  async getEstadisticas(): Promise<{
    totalPromociones: number;
    promocionesActivas: number;
    promocionesVencidas: number;
    totalDescuentoOtorgado: number;
    promocionMasUsada: any;
    usosHoy: number;
  }> {
    const total = await this.promocionRepository.count({ where: { isActive: true } });
    const activas = await this.promocionRepository.count({
      where: { estado: EstadoPromocion.ACTIVA, isActive: true },
    });
    const vencidas = await this.promocionRepository.count({
      where: { estado: EstadoPromocion.VENCIDA, isActive: true },
    });

    const promociones = await this.promocionRepository.find({
      where: { isActive: true },
    });

    const totalDescuento = promociones.reduce((sum, p) => sum + Number(p.totalDescuentoOtorgado), 0);

    const promocionMasUsada = await this.promocionRepository.findOne({
      where: { isActive: true },
      order: { totalVentas: 'DESC' },
    });

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    const usosHoy = await this.promocionUsoRepository.count({
      where: {
        fechaUso: Between(hoy, manana),
      },
    });

    return {
      totalPromociones: total,
      promocionesActivas: activas,
      promocionesVencidas: vencidas,
      totalDescuentoOtorgado: totalDescuento,
      promocionMasUsada: promocionMasUsada ? {
        nombre: promocionMasUsada.nombre,
        codigo: promocionMasUsada.codigo,
        totalUsos: promocionMasUsada.totalVentas,
        totalDescuento: promocionMasUsada.totalDescuentoOtorgado,
      } : null,
      usosHoy,
    };
  }

  private validarConfiguracionPromocion(dto: any): void {
    switch (dto.tipo) {
      case TipoPromocion.DESCUENTO_PORCENTAJE:
      case TipoPromocion.CUMPLEANOS:
        if (!dto.descuentoPorcentaje || dto.descuentoPorcentaje <= 0 || dto.descuentoPorcentaje > 100) {
          throw new BadRequestException('El porcentaje de descuento debe estar entre 1 y 100');
        }
        break;

      case TipoPromocion.DESCUENTO_MONTO:
        if (!dto.descuentoMonto || dto.descuentoMonto <= 0) {
          throw new BadRequestException('El monto de descuento debe ser mayor a 0');
        }
        break;
    }
  }

  private filtrarProductosAplicables(productos: any[], promocion: Promocion): any[] {
    return productos.filter(producto => {
      // Verificar productos excluidos
      if (promocion.productosExcluidos?.includes(producto.productoId)) {
        return false;
      }

      // Verificar productos específicos aplicables
      if (promocion.productosAplicables?.length > 0) {
        return promocion.productosAplicables.includes(producto.productoId);
      }

      // Verificar categorías aplicables
      if (promocion.categoriasAplicables?.length > 0 && producto.categoria) {
        return promocion.categoriasAplicables.includes(producto.categoria);
      }

      // Verificar marcas aplicables
      if (promocion.marcasAplicables?.length > 0 && producto.marca) {
        return promocion.marcasAplicables.includes(producto.marca);
      }

      // Si no hay restricciones específicas, aplica a todos
      return true;
    });
  }
}

