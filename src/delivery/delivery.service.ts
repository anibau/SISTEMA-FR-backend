import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { Delivery, EstadoDelivery, MetodoContacto } from './entities/delivery.entity';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';
import {
  UpdateEstadoDeliveryDto,
  CancelarDeliveryDto,
  CalificarDeliveryDto,
  AgregarContactoDto,
} from './dto/create-delivery.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class DeliveryService {
  constructor(
    @InjectRepository(Delivery)
    private deliveryRepository: Repository<Delivery>,
  ) {}

  async create(createDeliveryDto: CreateDeliveryDto): Promise<Delivery> {
    // Verificar que no exista un delivery para esta venta
    const existingDelivery = await this.deliveryRepository.findOne({
      where: { ventaId: createDeliveryDto.ventaId },
    });

    if (existingDelivery) {
      throw new ConflictException('Ya existe un delivery para esta venta');
    }

    // Generar número de pedido único
    const numeroPedido = await this.generarNumeroPedido();

    // Calcular fecha estimada de entrega si no se proporciona
    let fechaEntregaEstimada = createDeliveryDto.fechaEntregaEstimada;
    if (!fechaEntregaEstimada) {
      fechaEntregaEstimada = this.calcularFechaEstimada(createDeliveryDto.distanciaKm);
    }

    const delivery = this.deliveryRepository.create({
      ...createDeliveryDto,
      numeroPedido,
      fechaPedido: new Date(),
      fechaEntregaEstimada,
    });

    return await this.deliveryRepository.save(delivery);
  }

  async findAll(paginationDto: PaginationDto): Promise<{
    data: Delivery[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [deliveries, total] = await this.deliveryRepository.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: deliveries,
      total,
      page,
      limit,
    };
  }

  async findByEstado(estado: EstadoDelivery): Promise<Delivery[]> {
    return await this.deliveryRepository.find({
      where: { estado, isActive: true },
      order: { fechaPedido: 'ASC' },
    });
  }

  async findPendientes(): Promise<Delivery[]> {
    return await this.findByEstado(EstadoDelivery.PENDIENTE);
  }

  async findEnCamino(): Promise<Delivery[]> {
    return await this.findByEstado(EstadoDelivery.EN_CAMINO);
  }

  async findByRepartidor(repartidorId: string): Promise<Delivery[]> {
    return await this.deliveryRepository.find({
      where: { 
        repartidorId,
        estado: In([EstadoDelivery.EN_CAMINO, EstadoDelivery.PREPARANDO]),
        isActive: true,
      },
      order: { fechaPedido: 'ASC' },
    });
  }

  async findByCliente(clienteId: string, paginationDto: PaginationDto): Promise<{
    data: Delivery[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [deliveries, total] = await this.deliveryRepository.findAndCount({
      where: { clienteId, isActive: true },
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: deliveries,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Delivery> {
    const delivery = await this.deliveryRepository.findOne({
      where: { id, isActive: true },
    });

    if (!delivery) {
      throw new NotFoundException('Delivery no encontrado');
    }

    return delivery;
  }

  async findByNumeroPedido(numeroPedido: string): Promise<Delivery> {
    const delivery = await this.deliveryRepository.findOne({
      where: { numeroPedido, isActive: true },
    });

    if (!delivery) {
      throw new NotFoundException('Pedido no encontrado');
    }

    return delivery;
  }

  async update(id: string, updateDeliveryDto: UpdateDeliveryDto): Promise<Delivery> {
    const delivery = await this.findOne(id);

    if (!delivery.puedeModificar) {
      throw new BadRequestException('Este delivery no puede ser modificado');
    }

    Object.assign(delivery, updateDeliveryDto);
    return await this.deliveryRepository.save(delivery);
  }

  async confirmar(id: string, updateDto?: UpdateEstadoDeliveryDto): Promise<Delivery> {
    const delivery = await this.findOne(id);
    
    try {
      delivery.confirmar();
      
      if (updateDto) {
        Object.assign(delivery, updateDto);
      }
      
      return await this.deliveryRepository.save(delivery);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async iniciarPreparacion(id: string, updateDto?: UpdateEstadoDeliveryDto): Promise<Delivery> {
    const delivery = await this.findOne(id);
    
    try {
      delivery.iniciarPreparacion();
      
      if (updateDto) {
        Object.assign(delivery, updateDto);
      }
      
      return await this.deliveryRepository.save(delivery);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async enviar(id: string, updateDto?: UpdateEstadoDeliveryDto): Promise<Delivery> {
    const delivery = await this.findOne(id);
    
    try {
      delivery.enviarDelivery(updateDto?.repartidorId, updateDto?.repartidorNombre);
      
      if (updateDto) {
        Object.assign(delivery, updateDto);
      }
      
      return await this.deliveryRepository.save(delivery);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async entregar(id: string, updateDto?: UpdateEstadoDeliveryDto): Promise<Delivery> {
    const delivery = await this.findOne(id);
    
    try {
      delivery.entregar();
      
      if (updateDto) {
        Object.assign(delivery, updateDto);
      }
      
      return await this.deliveryRepository.save(delivery);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async cancelar(id: string, cancelarDto: CancelarDeliveryDto): Promise<Delivery> {
    const delivery = await this.findOne(id);
    
    try {
      delivery.cancelar(cancelarDto.motivo);
      return await this.deliveryRepository.save(delivery);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async calificar(id: string, calificarDto: CalificarDeliveryDto): Promise<Delivery> {
    const delivery = await this.findOne(id);
    
    try {
      delivery.calificar(calificarDto.calificacion, calificarDto.comentario);
      return await this.deliveryRepository.save(delivery);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async agregarContacto(id: string, contactoDto: AgregarContactoDto): Promise<Delivery> {
    const delivery = await this.findOne(id);
    
    delivery.agregarContacto(contactoDto.metodo, contactoDto.mensaje, contactoDto.exitoso);
    return await this.deliveryRepository.save(delivery);
  }

  async asignarRepartidor(id: string, repartidorId: string, repartidorNombre?: string): Promise<Delivery> {
    const delivery = await this.findOne(id);
    
    delivery.repartidorId = repartidorId;
    if (repartidorNombre) {
      delivery.repartidorNombre = repartidorNombre;
    }
    
    return await this.deliveryRepository.save(delivery);
  }

  async obtenerDeliveriesAtrasados(): Promise<Delivery[]> {
    const ahora = new Date();
    
    return await this.deliveryRepository.find({
      where: {
        fechaEntregaEstimada: Between(new Date('1900-01-01'), ahora),
        estado: In([EstadoDelivery.CONFIRMADO, EstadoDelivery.PREPARANDO, EstadoDelivery.EN_CAMINO]),
        isActive: true,
      },
      order: { fechaEntregaEstimada: 'ASC' },
    });
  }

  async obtenerDeliveriesHoy(): Promise<Delivery[]> {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    return await this.deliveryRepository.find({
      where: {
        fechaPedido: Between(hoy, manana),
        isActive: true,
      },
      order: { fechaPedido: 'DESC' },
    });
  }

  async getEstadisticas(): Promise<{
    totalDeliveries: number;
    deliveriesHoy: number;
    pendientes: number;
    enCamino: number;
    entregados: number;
    cancelados: number;
    atrasados: number;
    tiempoPromedioEntrega: number;
    calificacionPromedio: number;
    ingresosTotalDelivery: number;
  }> {
    const total = await this.deliveryRepository.count({ where: { isActive: true } });
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    const deliveriesHoy = await this.deliveryRepository.count({
      where: {
        fechaPedido: Between(hoy, manana),
        isActive: true,
      },
    });

    const pendientes = await this.deliveryRepository.count({
      where: { estado: EstadoDelivery.PENDIENTE, isActive: true },
    });

    const enCamino = await this.deliveryRepository.count({
      where: { estado: EstadoDelivery.EN_CAMINO, isActive: true },
    });

    const entregados = await this.deliveryRepository.count({
      where: { estado: EstadoDelivery.ENTREGADO, isActive: true },
    });

    const cancelados = await this.deliveryRepository.count({
      where: { estado: EstadoDelivery.CANCELADO, isActive: true },
    });

    const atrasados = await this.deliveryRepository.count({
      where: {
        fechaEntregaEstimada: Between(new Date('1900-01-01'), new Date()),
        estado: In([EstadoDelivery.CONFIRMADO, EstadoDelivery.PREPARANDO, EstadoDelivery.EN_CAMINO]),
        isActive: true,
      },
    });

    // Calcular tiempo promedio de entrega
    const deliveriesEntregados = await this.deliveryRepository.find({
      where: { 
        estado: EstadoDelivery.ENTREGADO,
        fechaEntregaReal: Between(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()),
        isActive: true,
      },
    });

    let tiempoPromedioEntrega = 0;
    if (deliveriesEntregados.length > 0) {
      const tiempoTotal = deliveriesEntregados.reduce((sum, d) => {
        return sum + (d.tiempoEntrega || 0);
      }, 0);
      tiempoPromedioEntrega = Math.round(tiempoTotal / deliveriesEntregados.length / (1000 * 60)); // en minutos
    }

    // Calcular calificación promedio
    const deliveriesCalificados = await this.deliveryRepository.find({
      where: { 
        calificacion: Between(1, 5),
        isActive: true,
      },
    });

    let calificacionPromedio = 0;
    if (deliveriesCalificados.length > 0) {
      const sumaCalificaciones = deliveriesCalificados.reduce((sum, d) => sum + (d.calificacion || 0), 0);
      calificacionPromedio = Math.round((sumaCalificaciones / deliveriesCalificados.length) * 10) / 10;
    }

    // Calcular ingresos totales por delivery
    const deliveriesConIngresos = await this.deliveryRepository.find({
      where: { isActive: true },
    });

    const ingresosTotalDelivery = deliveriesConIngresos.reduce((sum, d) => {
      return sum + Number(d.costoDelivery);
    }, 0);

    return {
      totalDeliveries: total,
      deliveriesHoy,
      pendientes,
      enCamino,
      entregados,
      cancelados,
      atrasados,
      tiempoPromedioEntrega,
      calificacionPromedio,
      ingresosTotalDelivery,
    };
  }

  async remove(id: string): Promise<void> {
    const delivery = await this.findOne(id);
    
    if (!delivery.puedeCancelar) {
      throw new BadRequestException('Este delivery no puede ser eliminado');
    }
    
    delivery.isActive = false;
    await this.deliveryRepository.save(delivery);
  }

  // Métodos privados de utilidad
  private async generarNumeroPedido(): Promise<string> {
    const fecha = new Date();
    const año = fecha.getFullYear().toString().slice(-2);
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const dia = fecha.getDate().toString().padStart(2, '0');
    
    // Buscar el último número del día
    const prefijo = `DEL${año}${mes}${dia}`;
    const ultimoDelivery = await this.deliveryRepository.findOne({
      where: { numeroPedido: Between(`${prefijo}000`, `${prefijo}999`) },
      order: { numeroPedido: 'DESC' },
    });

    let numeroSecuencial = 1;
    if (ultimoDelivery) {
      const ultimoNumero = parseInt(ultimoDelivery.numeroPedido.slice(-3));
      numeroSecuencial = ultimoNumero + 1;
    }

    return `${prefijo}${numeroSecuencial.toString().padStart(3, '0')}`;
  }

  private calcularFechaEstimada(distanciaKm?: number): Date {
    const tiempoBase = 30; // 30 minutos base
    const tiempoPorKm = 5; // 5 minutos por km
    const tiempoPreparacion = 15; // 15 minutos de preparación

    let tiempoTotal = tiempoBase + tiempoPreparacion;
    if (distanciaKm) {
      tiempoTotal += distanciaKm * tiempoPorKm;
    }

    const fechaEstimada = new Date();
    fechaEstimada.setMinutes(fechaEstimada.getMinutes() + tiempoTotal);
    
    return fechaEstimada;
  }
}

