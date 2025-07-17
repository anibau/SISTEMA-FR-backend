import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

export enum EstadoDelivery {
  PENDIENTE = 'pendiente',
  CONFIRMADO = 'confirmado',
  PREPARANDO = 'preparando',
  EN_CAMINO = 'en_camino',
  ENTREGADO = 'entregado',
  CANCELADO = 'cancelado',
  DEVUELTO = 'devuelto',
}

export enum TipoPedido {
  WHATSAPP = 'whatsapp',
  TELEFONO = 'telefono',
  WEB = 'web',
  APP = 'app',
}

export enum MetodoContacto {
  WHATSAPP = 'whatsapp',
  LLAMADA = 'llamada',
  SMS = 'sms',
}

@Entity('deliveries')
export class Delivery extends BaseEntity {
  @Column({ unique: true })
  numeroPedido: string;

  @Column()
  ventaId: string;

  @Column({ nullable: true })
  clienteId?: string;

  @Column({
    type: 'enum',
    enum: TipoPedido,
    default: TipoPedido.WHATSAPP,
  })
  tipoPedido: TipoPedido;

  @Column({
    type: 'enum',
    enum: EstadoDelivery,
    default: EstadoDelivery.PENDIENTE,
  })
  estado: EstadoDelivery;

  // Información del cliente
  @Column()
  clienteNombre: string;

  @Column()
  clienteTelefono: string;

  @Column({ nullable: true })
  clienteDocumento?: string;

  // Dirección de entrega
  @Column()
  direccionEntrega: string;

  @Column({ nullable: true })
  referenciaDireccion?: string;

  @Column({ nullable: true })
  distrito?: string;

  @Column({ nullable: true })
  provincia?: string;

  @Column({ nullable: true })
  departamento?: string;

  @Column({ type: 'decimal', precision: 8, scale: 6, nullable: true })
  latitud?: number;

  @Column({ type: 'decimal', precision: 9, scale: 6, nullable: true })
  longitud?: number;

  // Información del pedido
  @Column({ type: 'timestamp' })
  fechaPedido: Date;

  @Column({ type: 'timestamp', nullable: true })
  fechaEntregaEstimada?: Date;

  @Column({ type: 'timestamp', nullable: true })
  fechaEntregaReal?: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  montoTotal: number;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  costoDelivery: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  distanciaKm?: number;

  // Repartidor
  @Column({ nullable: true })
  repartidorId?: string;

  @Column({ nullable: true })
  repartidorNombre?: string;

  @Column({ nullable: true })
  repartidorTelefono?: string;

  // Seguimiento
  @Column({ type: 'timestamp', nullable: true })
  fechaConfirmacion?: Date;

  @Column({ type: 'timestamp', nullable: true })
  fechaPreparacion?: Date;

  @Column({ type: 'timestamp', nullable: true })
  fechaSalida?: Date;

  @Column({ type: 'timestamp', nullable: true })
  fechaEntrega?: Date;

  // Comunicación
  @Column({
    type: 'enum',
    enum: MetodoContacto,
    default: MetodoContacto.WHATSAPP,
  })
  metodoContactoPreferido: MetodoContacto;

  @Column({ type: 'json', nullable: true })
  historialContacto?: {
    fecha: Date;
    metodo: MetodoContacto;
    mensaje: string;
    exitoso: boolean;
  }[];

  // Información adicional
  @Column({ type: 'text', nullable: true })
  observaciones?: string;

  @Column({ type: 'text', nullable: true })
  motivoCancelacion?: string;

  @Column({ type: 'int', nullable: true, default: 1 })
  prioridad?: number; // 1 = alta, 2 = media, 3 = baja

  @Column({ default: false })
  requiereConfirmacion: boolean;

  @Column({ default: false })
  esPagoContraentrega: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  montoPagado?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cambioRequerido?: number;

  // Calificación
  @Column({ type: 'int', nullable: true })
  calificacion?: number; // 1-5 estrellas

  @Column({ type: 'text', nullable: true })
  comentarioCliente?: string;

  @Column({ type: 'timestamp', nullable: true })
  fechaCalificacion?: Date;

  // Relaciones
  // @ManyToOne(() => Venta, venta => venta.delivery)
  // @JoinColumn({ name: 'ventaId' })
  // venta: Venta;

  // @ManyToOne(() => Cliente, cliente => cliente.deliveries)
  // @JoinColumn({ name: 'clienteId' })
  // cliente: Cliente;

  // @ManyToOne(() => User, user => user.deliveriesAsignados)
  // @JoinColumn({ name: 'repartidorId' })
  // repartidor: User;

  // Métodos de utilidad
  get tiempoTranscurrido(): number {
    return Date.now() - this.fechaPedido.getTime();
  }

  get tiempoEntrega(): number | null {
    if (!this.fechaEntregaReal) return null;
    return this.fechaEntregaReal.getTime() - this.fechaPedido.getTime();
  }

  get estaEnTiempo(): boolean {
    if (!this.fechaEntregaEstimada) return true;
    const ahora = new Date();
    return ahora <= this.fechaEntregaEstimada;
  }

  get puedeCalificar(): boolean {
    return this.estado === EstadoDelivery.ENTREGADO && !this.calificacion;
  }

  get puedeModificar(): boolean {
    return [EstadoDelivery.PENDIENTE, EstadoDelivery.CONFIRMADO].includes(this.estado);
  }

  get puedeCancelar(): boolean {
    return ![EstadoDelivery.ENTREGADO, EstadoDelivery.CANCELADO].includes(this.estado);
  }

  confirmar(): void {
    if (this.estado !== EstadoDelivery.PENDIENTE) {
      throw new Error('Solo se pueden confirmar pedidos pendientes');
    }
    this.estado = EstadoDelivery.CONFIRMADO;
    this.fechaConfirmacion = new Date();
  }

  iniciarPreparacion(): void {
    if (this.estado !== EstadoDelivery.CONFIRMADO) {
      throw new Error('Solo se pueden preparar pedidos confirmados');
    }
    this.estado = EstadoDelivery.PREPARANDO;
    this.fechaPreparacion = new Date();
  }

  enviarDelivery(repartidorId?: string, repartidorNombre?: string): void {
    if (this.estado !== EstadoDelivery.PREPARANDO) {
      throw new Error('Solo se pueden enviar pedidos que están siendo preparados');
    }
    this.estado = EstadoDelivery.EN_CAMINO;
    this.fechaSalida = new Date();
    if (repartidorId) this.repartidorId = repartidorId;
    if (repartidorNombre) this.repartidorNombre = repartidorNombre;
  }

  entregar(): void {
    if (this.estado !== EstadoDelivery.EN_CAMINO) {
      throw new Error('Solo se pueden entregar pedidos en camino');
    }
    this.estado = EstadoDelivery.ENTREGADO;
    this.fechaEntrega = new Date();
    this.fechaEntregaReal = new Date();
  }

  cancelar(motivo: string): void {
    if (!this.puedeCancelar) {
      throw new Error('Este pedido no puede ser cancelado');
    }
    this.estado = EstadoDelivery.CANCELADO;
    this.motivoCancelacion = motivo;
  }

  calificar(puntuacion: number, comentario?: string): void {
    if (!this.puedeCalificar) {
      throw new Error('Este pedido no puede ser calificado');
    }
    if (puntuacion < 1 || puntuacion > 5) {
      throw new Error('La calificación debe estar entre 1 y 5');
    }
    this.calificacion = puntuacion;
    this.comentarioCliente = comentario;
    this.fechaCalificacion = new Date();
  }

  agregarContacto(metodo: MetodoContacto, mensaje: string, exitoso: boolean): void {
    if (!this.historialContacto) {
      this.historialContacto = [];
    }
    this.historialContacto.push({
      fecha: new Date(),
      metodo,
      mensaje,
      exitoso,
    });
  }

  calcularTiempoEstimadoEntrega(): Date {
    const tiempoBase = 30; // 30 minutos base
    const tiempoPorKm = 5; // 5 minutos por km
    const tiempoPreparacion = 15; // 15 minutos de preparación

    let tiempoTotal = tiempoBase + tiempoPreparacion;
    if (this.distanciaKm) {
      tiempoTotal += this.distanciaKm * tiempoPorKm;
    }

    const fechaEstimada = new Date(this.fechaPedido);
    fechaEstimada.setMinutes(fechaEstimada.getMinutes() + tiempoTotal);
    
    return fechaEstimada;
  }
}

