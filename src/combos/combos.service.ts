import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CreateComboDto } from './dto/create-combo.dto';
import { UpdateComboDto } from './dto/update-combo.dto';
import { Combo } from './entities/combo.entity';
import { ComboDetalle } from './entities/combo-detalle.entity';
import { Producto } from '../productos/entities/producto.entity';

@Injectable()
export class CombosService {
  constructor(
    @InjectRepository(Combo)
    private comboRepository: Repository<Combo>,
    @InjectRepository(ComboDetalle)
    private comboDetalleRepository: Repository<ComboDetalle>,
    @InjectRepository(Producto)
    private productoRepository: Repository<Producto>,
    private dataSource: DataSource,
  ) {}

  async create(createComboDto: CreateComboDto): Promise<Combo> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Verificar si ya existe un combo con el mismo código
      const comboExistente = await this.comboRepository.findOne({
        where: { codigo: createComboDto.codigo }
      });

      if (comboExistente) {
        throw new ConflictException('Ya existe un combo con este código');
      }

      // Validar que todos los productos existan y estén activos
      const productosValidados = [];
      for (const detalle of createComboDto.detalles) {
        const producto = await this.productoRepository.findOne({
          where: { id: detalle.productoId, isActive: true }
        });
        if (!producto) {
          throw new NotFoundException(`Producto ${detalle.productoId} no encontrado`);
        }
        productosValidados.push({ producto, detalle });
      }

      // Crear el combo
      const combo = this.comboRepository.create({
        codigo: createComboDto.codigo,
        nombre: createComboDto.nombre,
        descripcion: createComboDto.descripcion,
        precio: createComboDto.precio,
        precioCombo: createComboDto.precio, // Alias
        precioOriginal: createComboDto.precioOriginal,
        descuentoPorcentaje: createComboDto.descuentoPorcentaje,
        descuento: createComboDto.descuentoPorcentaje, // Alias
        imagen: createComboDto.imagen,
        esVisible: createComboDto.esVisible ?? true,
        esDestacado: createComboDto.esDestacado ?? false,
        fechaInicio: createComboDto.fechaInicio ? new Date(createComboDto.fechaInicio) : null,
        fechaFin: createComboDto.fechaFin ? new Date(createComboDto.fechaFin) : null,
        totalVendido: 0,
        totalIngresos: 0,
      });

      const comboGuardado = await queryRunner.manager.save(combo);

      // Crear los detalles del combo
      for (const { producto, detalle } of productosValidados) {
        const comboDetalle = this.comboDetalleRepository.create({
          combo: comboGuardado,
          producto,
          cantidad: detalle.cantidad,
          precioUnitario: detalle.precioUnitario,
        });

        await queryRunner.manager.save(comboDetalle);
      }

      await queryRunner.commitTransaction();

      return this.findOne(comboGuardado.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(page: number = 1, limit: number = 10, filters?: any): Promise<{ data: Combo[], total: number }> {
    const queryBuilder = this.comboRepository.createQueryBuilder('combo')
      .leftJoinAndSelect('combo.detalles', 'detalles')
      .leftJoinAndSelect('detalles.producto', 'producto')
      .where('combo.isActive = :isActive', { isActive: true });

    // Aplicar filtros
    if (filters?.esVisible !== undefined) {
      queryBuilder.andWhere('combo.esVisible = :esVisible', { esVisible: filters.esVisible });
    }
    if (filters?.esDestacado !== undefined) {
      queryBuilder.andWhere('combo.esDestacado = :esDestacado', { esDestacado: filters.esDestacado });
    }
    if (filters?.search) {
      queryBuilder.andWhere(
        '(combo.nombre ILIKE :search OR combo.codigo ILIKE :search OR combo.descripcion ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    queryBuilder
      .orderBy('combo.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total };
  }

  async findOne(id: string): Promise<Combo> {
    const combo = await this.comboRepository.findOne({
      where: { id, isActive: true },
      relations: ['detalles', 'detalles.producto'],
    });

    if (!combo) {
      throw new NotFoundException('Combo no encontrado');
    }

    return combo;
  }

  async findByCodigo(codigo: string): Promise<Combo> {
    const combo = await this.comboRepository.findOne({
      where: { codigo, isActive: true },
      relations: ['detalles', 'detalles.producto'],
    });

    if (!combo) {
      throw new NotFoundException('Combo no encontrado');
    }

    return combo;
  }

  async update(id: string, updateComboDto: UpdateComboDto): Promise<Combo> {
    const combo = await this.findOne(id);

    // Si se está actualizando el código, verificar que no exista otro combo con el mismo
    if (updateComboDto.codigo && updateComboDto.codigo !== combo.codigo) {
      const comboExistente = await this.comboRepository.findOne({
        where: { codigo: updateComboDto.codigo }
      });
      if (comboExistente) {
        throw new ConflictException('Ya existe un combo con este código');
      }
    }

    const datosActualizacion = {
      ...updateComboDto,
      precioCombo: updateComboDto.precio || combo.precio, // Mantener alias sincronizado
      descuento: updateComboDto.descuentoPorcentaje || combo.descuentoPorcentaje, // Mantener alias sincronizado
      fechaInicio: updateComboDto.fechaInicio ? new Date(updateComboDto.fechaInicio) : combo.fechaInicio,
      fechaFin: updateComboDto.fechaFin ? new Date(updateComboDto.fechaFin) : combo.fechaFin,
    };

    await this.comboRepository.update(id, datosActualizacion);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const combo = await this.findOne(id);
    await this.comboRepository.update(id, { isActive: false });
  }

  async getCombosDisponibles(): Promise<Combo[]> {
    const ahora = new Date();
    
    return await this.comboRepository
      .createQueryBuilder('combo')
      .leftJoinAndSelect('combo.detalles', 'detalles')
      .leftJoinAndSelect('detalles.producto', 'producto')
      .where('combo.isActive = :isActive', { isActive: true })
      .andWhere('combo.esVisible = :esVisible', { esVisible: true })
      .andWhere('(combo.fechaInicio IS NULL OR combo.fechaInicio <= :ahora)', { ahora })
      .andWhere('(combo.fechaFin IS NULL OR combo.fechaFin >= :ahora)', { ahora })
      .orderBy('combo.esDestacado', 'DESC')
      .addOrderBy('combo.createdAt', 'DESC')
      .getMany();
  }

  async getCombosDestacados(): Promise<Combo[]> {
    return await this.comboRepository.find({
      where: { 
        isActive: true, 
        esVisible: true, 
        esDestacado: true 
      },
      relations: ['detalles', 'detalles.producto'],
      order: { createdAt: 'DESC' },
    });
  }

  async verificarDisponibilidadStock(id: string): Promise<{ disponible: boolean, faltantes: any[] }> {
    const combo = await this.findOne(id);
    const faltantes = [];

    for (const detalle of combo.detalles) {
      if (detalle.producto.stock < detalle.cantidad) {
        faltantes.push({
          producto: detalle.producto.nombre,
          requerido: detalle.cantidad,
          disponible: detalle.producto.stock,
          faltante: detalle.cantidad - detalle.producto.stock,
        });
      }
    }

    return {
      disponible: faltantes.length === 0,
      faltantes,
    };
  }

  async actualizarEstadisticas(id: string, cantidadVendida: number, ingresoGenerado: number): Promise<Combo> {
    const combo = await this.findOne(id);
    
    combo.totalVendido += cantidadVendida;
    combo.totalIngresos += ingresoGenerado;
    
    await this.comboRepository.save(combo);
    return combo;
  }

  async getCombosMasVendidos(limit: number = 10): Promise<Combo[]> {
    return await this.comboRepository.find({
      where: { isActive: true },
      relations: ['detalles', 'detalles.producto'],
      order: { totalVendido: 'DESC' },
      take: limit,
    });
  }

  async recalcularPrecioOriginal(id: string): Promise<Combo> {
    const combo = await this.findOne(id);
    
    const precioOriginalCalculado = combo.detalles.reduce((total, detalle) => {
      return total + (detalle.precioUnitario * detalle.cantidad);
    }, 0);

    combo.precioOriginal = precioOriginalCalculado;
    combo.descuentoPorcentaje = ((precioOriginalCalculado - combo.precio) / precioOriginalCalculado) * 100;
    combo.descuento = combo.descuentoPorcentaje; // Mantener alias sincronizado

    await this.comboRepository.save(combo);
    return combo;
  }

  async duplicarCombo(id: string, nuevoCodigo: string, nuevoNombre: string): Promise<Combo> {
    const comboOriginal = await this.findOne(id);

    // Verificar que el nuevo código no exista
    const comboExistente = await this.comboRepository.findOne({
      where: { codigo: nuevoCodigo }
    });

    if (comboExistente) {
      throw new ConflictException('Ya existe un combo con este código');
    }

    const createComboDto: CreateComboDto = {
      codigo: nuevoCodigo,
      nombre: nuevoNombre,
      descripcion: comboOriginal.descripcion,
      precio: comboOriginal.precio,
      precioOriginal: comboOriginal.precioOriginal,
      descuentoPorcentaje: comboOriginal.descuentoPorcentaje,
      imagen: comboOriginal.imagen,
      esVisible: comboOriginal.esVisible,
      esDestacado: false, // Los duplicados no son destacados por defecto
      fechaInicio: comboOriginal.fechaInicio?.toISOString(),
      fechaFin: comboOriginal.fechaFin?.toISOString(),
      detalles: comboOriginal.detalles.map(detalle => ({
        productoId: detalle.producto.id,
        cantidad: detalle.cantidad,
        precioUnitario: detalle.precioUnitario,
      })),
    };

    return this.create(createComboDto);
  }

  async getEstadisticas(): Promise<any> {
    const totalCombos = await this.comboRepository.count({
      where: { isActive: true }
    });

    const combosActivos = await this.comboRepository.count({
      where: { isActive: true, esVisible: true }
    });

    const combosDestacados = await this.comboRepository.count({
      where: { isActive: true, esDestacado: true }
    });

    const totalVendido = await this.comboRepository
      .createQueryBuilder('combo')
      .select('SUM(combo.totalVendido)', 'total')
      .where('combo.isActive = :isActive', { isActive: true })
      .getRawOne();

    const totalIngresos = await this.comboRepository
      .createQueryBuilder('combo')
      .select('SUM(combo.totalIngresos)', 'total')
      .where('combo.isActive = :isActive', { isActive: true })
      .getRawOne();

    return {
      totalCombos,
      combosActivos,
      combosDestacados,
      totalVendido: totalVendido?.total || 0,
      totalIngresos: totalIngresos?.total || 0,
    };
  }
}

