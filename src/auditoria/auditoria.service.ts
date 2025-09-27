import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { CreateAuditoriaDto } from './dto/create-auditoria.dto';
import { Auditoria, TipoAccion, TipoEntidad } from './entities/auditoria.entity';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class AuditoriaService {
  constructor(
    @InjectRepository(Auditoria)
    private auditoriaRepository: Repository<Auditoria>,
    @InjectRepository(User)
    private usuarioRepository: Repository<User>,
  ) {}

  async create(createAuditoriaDto: CreateAuditoriaDto): Promise<Auditoria> {
    // Validar que el usuario existe
    const usuario = await this.usuarioRepository.findOne({
      where: { id: createAuditoriaDto.usuarioId, isActive: true }
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const auditoria = this.auditoriaRepository.create({
      ...createAuditoriaDto,
    });

    return await this.auditoriaRepository.save(auditoria);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    filters?: {
      accion?: TipoAccion;
      entidad?: TipoEntidad;
      usuarioId?: string;
      entidadId?: string;
      fechaInicio?: Date;
      fechaFin?: Date;
    }
  ): Promise<{ data: Auditoria[], total: number }> {
    const queryBuilder = this.auditoriaRepository.createQueryBuilder('auditoria')
      .leftJoinAndSelect('auditoria.usuario', 'usuario')
      .where('auditoria.isActive = :isActive', { isActive: true });

    // Aplicar filtros
    if (filters?.accion) {
      queryBuilder.andWhere('auditoria.accion = :accion', { accion: filters.accion });
    }
    if (filters?.entidad) {
      queryBuilder.andWhere('auditoria.entidad = :entidad', { entidad: filters.entidad });
    }
    if (filters?.usuarioId) {
      queryBuilder.andWhere('auditoria.usuarioId = :usuarioId', { usuarioId: filters.usuarioId });
    }
    if (filters?.entidadId) {
      queryBuilder.andWhere('auditoria.entidadId = :entidadId', { entidadId: filters.entidadId });
    }
    if (filters?.fechaInicio) {
      queryBuilder.andWhere('auditoria.createdAt >= :fechaInicio', { fechaInicio: filters.fechaInicio });
    }
    if (filters?.fechaFin) {
      queryBuilder.andWhere('auditoria.createdAt <= :fechaFin', { fechaFin: filters.fechaFin });
    }

    queryBuilder
      .orderBy('auditoria.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total };
  }

  async findOne(id: string): Promise<Auditoria> {
    const auditoria = await this.auditoriaRepository.findOne({
      where: { id, isActive: true },
      relations: ['usuario'],
    });

    if (!auditoria) {
      throw new NotFoundException('Registro de auditoría no encontrado');
    }

    return auditoria;
  }

  async findByEntidad(entidad: TipoEntidad, entidadId: string): Promise<Auditoria[]> {
    return await this.auditoriaRepository.find({
      where: { 
        entidad, 
        entidadId, 
        isActive: true 
      },
      relations: ['usuario'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByUsuario(usuarioId: string, page: number = 1, limit: number = 10): Promise<{ data: Auditoria[], total: number }> {
    const [data, total] = await this.auditoriaRepository.findAndCount({
      where: { 
        usuarioId, 
        isActive: true 
      },
      relations: ['usuario'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }

  async getActividadReciente(limit: number = 20): Promise<Auditoria[]> {
    return await this.auditoriaRepository.find({
      where: { isActive: true },
      relations: ['usuario'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getEstadisticasPorPeriodo(fechaInicio: Date, fechaFin: Date): Promise<any> {
    const estadisticas = await this.auditoriaRepository
      .createQueryBuilder('auditoria')
      .select([
        'auditoria.accion',
        'auditoria.entidad',
        'COUNT(*) as total'
      ])
      .where('auditoria.isActive = :isActive', { isActive: true })
      .andWhere('auditoria.createdAt BETWEEN :fechaInicio AND :fechaFin', { fechaInicio, fechaFin })
      .groupBy('auditoria.accion, auditoria.entidad')
      .orderBy('total', 'DESC')
      .getRawMany();

    return estadisticas;
  }

  async getUsuariosMasActivos(limit: number = 10): Promise<any> {
    const usuarios = await this.auditoriaRepository
      .createQueryBuilder('auditoria')
      .leftJoinAndSelect('auditoria.usuario', 'usuario')
      .select([
        'usuario.id',
        'usuario.nombres',
        'usuario.apellidos',
        'usuario.email',
        'COUNT(*) as totalAcciones'
      ])
      .where('auditoria.isActive = :isActive', { isActive: true })
      .groupBy('usuario.id, usuario.nombres, usuario.apellidos, usuario.email')
      .orderBy('totalAcciones', 'DESC')
      .limit(limit)
      .getRawMany();

    return usuarios;
  }

  async getAccionesPorDia(dias: number = 30): Promise<any> {
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - dias);

    const acciones = await this.auditoriaRepository
      .createQueryBuilder('auditoria')
      .select([
        'DATE(auditoria.createdAt) as fecha',
        'COUNT(*) as totalAcciones'
      ])
      .where('auditoria.isActive = :isActive', { isActive: true })
      .andWhere('auditoria.createdAt >= :fechaInicio', { fechaInicio })
      .groupBy('DATE(auditoria.createdAt)')
      .orderBy('fecha', 'ASC')
      .getRawMany();

    return acciones;
  }

  async registrarAcceso(usuarioId: string, ip?: string, userAgent?: string): Promise<Auditoria> {
    const createAuditoriaDto: CreateAuditoriaDto = {
      accion: TipoAccion.ACCESO,
      entidad: TipoEntidad.USUARIO,
      entidadId: usuarioId,
      usuarioId,
      ip,
      userAgent,
      descripcion: `Usuario inició sesión - Tipo: login, Timestamp: ${new Date().toISOString()}`,
    };

    return this.create(createAuditoriaDto);
  }

  async registrarCierreSesion(usuarioId: string, ip?: string): Promise<Auditoria> {
    const createAuditoriaDto: CreateAuditoriaDto = {
      accion: TipoAccion.ACCESO,
      entidad: TipoEntidad.USUARIO,
      entidadId: usuarioId,
      usuarioId,
      ip,
      descripcion: `Usuario cerró sesión - Tipo: logout, Timestamp: ${new Date().toISOString()}`,
    };

    return this.create(createAuditoriaDto);
  }

  async registrarCambioPassword(usuarioId: string, ip?: string): Promise<Auditoria> {
    const createAuditoriaDto: CreateAuditoriaDto = {
      accion: TipoAccion.ACTUALIZAR,
      entidad: TipoEntidad.USUARIO,
      entidadId: usuarioId,
      usuarioId,
      ip,
      descripcion: `Usuario cambió su contraseña - Tipo: cambio_password, Timestamp: ${new Date().toISOString()}`,
    };

    return this.create(createAuditoriaDto);
  }

  async registrarCambioProducto(
    productoId: string,
    usuarioId: string,
    valoresAnteriores: any,
    valoresNuevos: any,
    descripcion?: string,
    ip?: string
  ): Promise<Auditoria> {
    const createAuditoriaDto: CreateAuditoriaDto = {
      accion: TipoAccion.ACTUALIZAR,
      entidad: TipoEntidad.PRODUCTO,
      entidadId: productoId,
      usuarioId,
      valoresAnteriores: valoresAnteriores,
      valoresNuevos: valoresNuevos,
      ip,
      descripcion: `${descripcion || 'Producto actualizado'} - Tipo: cambio_producto, Timestamp: ${new Date().toISOString()}`,
    };

    return this.create(createAuditoriaDto);
  }

  async registrarVenta(
    ventaId: string,
    usuarioId: string,
    total: number,
    metodoPago: string,
    ip?: string
  ): Promise<Auditoria> {
    const createAuditoriaDto: CreateAuditoriaDto = {
      accion: TipoAccion.CREAR,
      entidad: TipoEntidad.VENTA,
      entidadId: ventaId,
      usuarioId,
      valoresNuevos: {
        total,
        metodoPago,
      },
      ip,
      descripcion: `Venta registrada por S/${total} - ${metodoPago} - Tipo: nueva_venta, Timestamp: ${new Date().toISOString()}`,
    };

    return this.create(createAuditoriaDto);
  }

  async limpiarRegistrosAntiguos(diasAntiguedad: number = 365): Promise<number> {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - diasAntiguedad);

    const resultado = await this.auditoriaRepository
      .createQueryBuilder()
      .update(Auditoria)
      .set({ isActive: false })
      .where('createdAt < :fechaLimite', { fechaLimite })
      .execute();

    return resultado.affected || 0;
  }

  async exportarAuditoria(
    fechaInicio: Date,
    fechaFin: Date,
    formato: 'json' | 'csv' = 'json'
  ): Promise<any> {
    const registros = await this.auditoriaRepository.find({
      where: {
        isActive: true,
        createdAt: Between(fechaInicio, fechaFin),
      },
      relations: ['usuario'],
      order: { createdAt: 'DESC' },
    });

    if (formato === 'json') {
      return registros;
    }

    // Para CSV, convertir a formato plano
    return registros.map(registro => ({
      fecha: registro.createdAt,
      accion: registro.accion,
      entidad: registro.entidad,
      entidadId: registro.entidadId,
      usuario: `${registro.usuario.firstName} ${registro.usuario.lastName}`,
      descripcion: registro.descripcion,
      ip: registro.ip,
    }));
  }
}
