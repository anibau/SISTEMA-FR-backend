import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull, Not } from 'typeorm';
import { Notificacion, TipoNotificacion, PrioridadNotificacion, EstadoNotificacion } from './entities/notificacion.entity';
import { CreateNotificacionDto } from './dto/create-notificacion.dto';
import { UpdateNotificacionDto } from './dto/update-notificacion.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class NotificacionesService {
  constructor(
    @InjectRepository(Notificacion)
    private notificacionRepository: Repository<Notificacion>,
  ) {}

  async create(createNotificacionDto: CreateNotificacionDto): Promise<Notificacion> {
    const notificacion = this.notificacionRepository.create({
      ...createNotificacionDto,
      fechaCreacion: new Date(),
      prioridad: createNotificacionDto.prioridad || PrioridadNotificacion.MEDIA,
      origen: createNotificacionDto.origen || 'sistema',
      mostrarEnDashboard: createNotificacionDto.mostrarEnDashboard ?? true,
    });

    return await this.notificacionRepository.save(notificacion);
  }

  async findAll(paginationDto: PaginationDto): Promise<{
    data: Notificacion[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [notificaciones, total] = await this.notificacionRepository.findAndCount({
      where: { isActive: true },
      skip,
      take: limit,
      order: { fechaCreacion: 'DESC' },
    });

    return {
      data: notificaciones,
      total,
      page,
      limit,
    };
  }

  async findByUsuario(usuarioId: string, paginationDto: PaginationDto): Promise<{
    data: Notificacion[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [notificaciones, total] = await this.notificacionRepository.findAndCount({
      where: [
        { usuarioId, isActive: true },
        { usuarioId: IsNull(), isActive: true }, // Notificaciones globales
      ],
      skip,
      take: limit,
      order: { fechaCreacion: 'DESC' },
    });

    return {
      data: notificaciones,
      total,
      page,
      limit,
    };
  }

  async findByRol(rol: string, paginationDto: PaginationDto): Promise<{
    data: Notificacion[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [notificaciones, total] = await this.notificacionRepository.findAndCount({
      where: [
        { rolDestino: rol, isActive: true },
        { usuarioId: IsNull(), rolDestino: IsNull(), isActive: true }, // Notificaciones globales
      ],
      skip,
      take: limit,
      order: { fechaCreacion: 'DESC' },
    });

    return {
      data: notificaciones,
      total,
      page,
      limit,
    };
  }

  async findByTipo(tipo: TipoNotificacion): Promise<Notificacion[]> {
    return await this.notificacionRepository.find({
      where: { tipo, isActive: true },
      order: { fechaCreacion: 'DESC' },
    });
  }

  async findByPrioridad(prioridad: PrioridadNotificacion): Promise<Notificacion[]> {
    return await this.notificacionRepository.find({
      where: { prioridad, isActive: true },
      order: { fechaCreacion: 'DESC' },
    });
  }

  async findByEstado(estado: EstadoNotificacion): Promise<Notificacion[]> {
    return await this.notificacionRepository.find({
      where: { estado, isActive: true },
      order: { fechaCreacion: 'DESC' },
    });
  }

  async findPendientes(usuarioId?: string): Promise<Notificacion[]> {
    const whereCondition: any = {
      estado: EstadoNotificacion.PENDIENTE,
      isActive: true,
    };

    if (usuarioId) {
      return await this.notificacionRepository.find({
        where: [
          { ...whereCondition, usuarioId },
          { ...whereCondition, usuarioId: IsNull() }, // Notificaciones globales
        ],
        order: { fechaCreacion: 'DESC' },
      });
    }

    return await this.notificacionRepository.find({
      where: whereCondition,
      order: { fechaCreacion: 'DESC' },
    });
  }

  async findCriticas(): Promise<Notificacion[]> {
    return await this.findByPrioridad(PrioridadNotificacion.CRITICA);
  }

  async findParaDashboard(usuarioId?: string): Promise<Notificacion[]> {
    const whereCondition: any = {
      mostrarEnDashboard: true,
      estado: In([EstadoNotificacion.PENDIENTE, EstadoNotificacion.LEIDA]),
      isActive: true,
    };

    if (usuarioId) {
      return await this.notificacionRepository.find({
        where: [
          { ...whereCondition, usuarioId },
          { ...whereCondition, usuarioId: IsNull() }, // Notificaciones globales
        ],
        order: { fechaCreacion: 'DESC' },
        take: 20, // Limitar a las 20 más recientes para el dashboard
      });
    }

    return await this.notificacionRepository.find({
      where: whereCondition,
      order: { fechaCreacion: 'DESC' },
      take: 20,
    });
  }

  async findExpiradas(): Promise<Notificacion[]> {
    return await this.notificacionRepository.find({
      where: {
        fechaExpiracion: Not(IsNull()),
        isActive: true,
      },
      order: { fechaExpiracion: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Notificacion> {
    const notificacion = await this.notificacionRepository.findOne({
      where: { id, isActive: true },
    });

    if (!notificacion) {
      throw new NotFoundException('Notificación no encontrada');
    }

    return notificacion;
  }

  async update(id: string, updateNotificacionDto: UpdateNotificacionDto): Promise<Notificacion> {
    const notificacion = await this.findOne(id);

    Object.assign(notificacion, updateNotificacionDto);
    return await this.notificacionRepository.save(notificacion);
  }

  async marcarComoLeida(id: string): Promise<Notificacion> {
    const notificacion = await this.findOne(id);
    
    notificacion.marcarComoLeida();
    return await this.notificacionRepository.save(notificacion);
  }

  async marcarVariasComoLeidas(ids: string[]): Promise<{ actualizadas: number }> {
    const result = await this.notificacionRepository.update(
      {
        id: In(ids),
        estado: EstadoNotificacion.PENDIENTE,
        isActive: true,
      },
      {
        estado: EstadoNotificacion.LEIDA,
        fechaLectura: new Date(),
      }
    );

    return { actualizadas: result.affected || 0 };
  }

  async marcarTodasComoLeidas(usuarioId?: string): Promise<{ actualizadas: number }> {
    const whereCondition: any = {
      estado: EstadoNotificacion.PENDIENTE,
      isActive: true,
    };

    if (usuarioId) {
      // Marcar las del usuario específico y las globales
      const result1 = await this.notificacionRepository.update(
        { ...whereCondition, usuarioId },
        {
          estado: EstadoNotificacion.LEIDA,
          fechaLectura: new Date(),
        }
      );

      const result2 = await this.notificacionRepository.update(
        { ...whereCondition, usuarioId: IsNull() },
        {
          estado: EstadoNotificacion.LEIDA,
          fechaLectura: new Date(),
        }
      );

      return { actualizadas: (result1.affected || 0) + (result2.affected || 0) };
    }

    const result = await this.notificacionRepository.update(
      whereCondition,
      {
        estado: EstadoNotificacion.LEIDA,
        fechaLectura: new Date(),
      }
    );

    return { actualizadas: result.affected || 0 };
  }

  async archivar(id: string): Promise<Notificacion> {
    const notificacion = await this.findOne(id);
    
    notificacion.archivar();
    return await this.notificacionRepository.save(notificacion);
  }

  async archivarVarias(ids: string[]): Promise<{ archivadas: number }> {
    const result = await this.notificacionRepository.update(
      {
        id: In(ids),
        estado: In([EstadoNotificacion.PENDIENTE, EstadoNotificacion.LEIDA]),
        isActive: true,
      },
      {
        estado: EstadoNotificacion.ARCHIVADA,
        fechaArchivado: new Date(),
      }
    );

    return { archivadas: result.affected || 0 };
  }

  async restaurar(id: string): Promise<Notificacion> {
    const notificacion = await this.findOne(id);
    
    notificacion.restaurar();
    return await this.notificacionRepository.save(notificacion);
  }

  async limpiarExpiradas(): Promise<{ eliminadas: number }> {
    const notificacionesExpiradas = await this.notificacionRepository.find({
      where: {
        fechaExpiracion: Not(IsNull()),
        isActive: true,
      },
    });

    const expiradas = notificacionesExpiradas.filter(n => n.estaExpirada);
    
    if (expiradas.length > 0) {
      const ids = expiradas.map(n => n.id);
      const result = await this.notificacionRepository.update(
        { id: In(ids) },
        { isActive: false }
      );

      return { eliminadas: result.affected || 0 };
    }

    return { eliminadas: 0 };
  }

  async obtenerContadores(usuarioId?: string): Promise<{
    total: number;
    pendientes: number;
    leidas: number;
    archivadas: number;
    criticas: number;
    altas: number;
  }> {
    const whereCondition: any = { isActive: true };
    const whereConditionUser: any[] = [];

    if (usuarioId) {
      whereConditionUser.push(
        { ...whereCondition, usuarioId },
        { ...whereCondition, usuarioId: IsNull() }
      );
    } else {
      whereConditionUser.push(whereCondition);
    }

    const total = await this.notificacionRepository.count({
      where: usuarioId ? whereConditionUser : whereCondition,
    });

    const pendientes = await this.notificacionRepository.count({
      where: usuarioId 
        ? whereConditionUser.map(w => ({ ...w, estado: EstadoNotificacion.PENDIENTE }))
        : { ...whereCondition, estado: EstadoNotificacion.PENDIENTE },
    });

    const leidas = await this.notificacionRepository.count({
      where: usuarioId 
        ? whereConditionUser.map(w => ({ ...w, estado: EstadoNotificacion.LEIDA }))
        : { ...whereCondition, estado: EstadoNotificacion.LEIDA },
    });

    const archivadas = await this.notificacionRepository.count({
      where: usuarioId 
        ? whereConditionUser.map(w => ({ ...w, estado: EstadoNotificacion.ARCHIVADA }))
        : { ...whereCondition, estado: EstadoNotificacion.ARCHIVADA },
    });

    const criticas = await this.notificacionRepository.count({
      where: usuarioId 
        ? whereConditionUser.map(w => ({ ...w, prioridad: PrioridadNotificacion.CRITICA }))
        : { ...whereCondition, prioridad: PrioridadNotificacion.CRITICA },
    });

    const altas = await this.notificacionRepository.count({
      where: usuarioId 
        ? whereConditionUser.map(w => ({ ...w, prioridad: PrioridadNotificacion.ALTA }))
        : { ...whereCondition, prioridad: PrioridadNotificacion.ALTA },
    });

    return {
      total,
      pendientes,
      leidas,
      archivadas,
      criticas,
      altas,
    };
  }

  async crearNotificacionStockBajo(productoId: string, productoNombre: string, stockActual: number, stockMinimo: number): Promise<Notificacion> {
    const notificacionData = Notificacion.crearNotificacionStockBajo(productoId, productoNombre, stockActual, stockMinimo);
    return await this.create(notificacionData as CreateNotificacionDto);
  }

  async crearNotificacionProductoAgotado(productoId: string, productoNombre: string): Promise<Notificacion> {
    const notificacionData = Notificacion.crearNotificacionProductoAgotado(productoId, productoNombre);
    return await this.create(notificacionData as CreateNotificacionDto);
  }

  async crearNotificacionVentaRealizada(ventaId: string, monto: number, clienteNombre?: string): Promise<Notificacion> {
    const notificacionData = Notificacion.crearNotificacionVentaRealizada(ventaId, monto, clienteNombre);
    return await this.create(notificacionData as CreateNotificacionDto);
  }

  async crearNotificacionCumpleanos(clienteId: string, clienteNombre: string): Promise<Notificacion> {
    const notificacionData = Notificacion.crearNotificacionCumpleanos(clienteId, clienteNombre);
    return await this.create(notificacionData as CreateNotificacionDto);
  }

  async crearNotificacionDeliveryAtrasado(deliveryId: string, numeroPedido: string, clienteNombre: string): Promise<Notificacion> {
    const notificacionData = Notificacion.crearNotificacionDeliveryAtrasado(deliveryId, numeroPedido, clienteNombre);
    return await this.create(notificacionData as CreateNotificacionDto);
  }

  async remove(id: string): Promise<void> {
    const notificacion = await this.findOne(id);
    
    notificacion.isActive = false;
    await this.notificacionRepository.save(notificacion);
  }
}

