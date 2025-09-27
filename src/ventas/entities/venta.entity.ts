import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { VentaDetalle } from './venta-detalle.entity';
import { User } from '../../auth/entities/user.entity';
import { Cliente } from '../../clientes/entities/cliente.entity';

export enum EstadoVenta {
  PENDIENTE = 'pendiente',
  COMPLETADA = 'completada',
  CANCELADA = 'cancelada',
  ANULADA = 'anulada',
}

export enum MetodoPago {
  EFECTIVO = 'efectivo',
  YAPE = 'yape',
  PLIN = 'plin',
  TRANSFERENCIA = 'transferencia',
  TARJETA = 'tarjeta',
  MIXTO = 'mixto',
}

export enum TipoVenta {
  MOSTRADOR = 'mostrador',
  DELIVERY = 'delivery',
  TELEFONICA = 'telefonica',
}

@Entity('ventas')
export class Venta extends BaseEntity {
  @Column({ unique: true })
  numeroVenta: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaVenta: Date;

  // Relaciones
  @ManyToOne(() => User)
  @JoinColumn({ name: 'vendedor_id' })
  vendedor: User;

  @Column({ name: 'vendedor_id' })
  vendedorId: string;

  @ManyToOne(() => Cliente, { nullable: true })
  @JoinColumn({ name: 'cliente_id' })
  cliente?: Cliente;

  @Column({ name: 'cliente_id', nullable: true })
  clienteId?: string;

  @OneToMany(() => VentaDetalle, (detalle) => detalle.venta, { cascade: true })
  detalles: VentaDetalle[];

  @Column({
    type: 'enum',
    enum: TipoVenta,
    default: TipoVenta.MOSTRADOR,
  })
  tipoVenta: TipoVenta;

  @Column({
    type: 'enum',
    enum: EstadoVenta,
    default: EstadoVenta.PENDIENTE,
  })
  estado: EstadoVenta;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalDescuentos: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  impuestos: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({
    type: 'enum',
    enum: MetodoPago,
    default: MetodoPago.EFECTIVO,
  })
  metodoPago: MetodoPago;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  montoPagado?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cambio?: number;

  // Información del cliente (si no está registrado)
  @Column({ nullable: true })
  clienteNombre?: string;

  @Column({ nullable: true })
  clienteDocumento?: string;

  @Column({ nullable: true })
  clienteTelefono?: string;

  // Información de delivery
  @Column({ nullable: true })
  direccionEntrega?: string;

  @Column({ type: 'decimal', precision: 8, scale: 6, nullable: true })
  latitud?: number;

  @Column({ type: 'decimal', precision: 9, scale: 6, nullable: true })
  longitud?: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  costoDelivery: number;

  // Puntos y promociones
  @Column({ type: 'int', default: 0 })
  puntosGenerados: number;

  @Column({ type: 'int', default: 0 })
  puntosUsados: number;

  @Column({ type: 'text', nullable: true })
  observaciones?: string;

  // Información adicional
  @Column({ nullable: true })
  ticketId?: string; // Para multiticket

  @Column({ nullable: true })
  referencia?: string;

  @Column({ type: 'timestamp', nullable: true })
  fechaEntrega?: Date;

  @Column({ nullable: true })
  repartidor?: string;

  // Métodos de utilidad
  calcularTotales(): void {
    this.subtotal = this.detalles?.reduce((sum, detalle) => sum + detalle.subtotal, 0) || 0;
    this.total = this.subtotal - this.totalDescuentos + this.impuestos + this.costoDelivery;
  }

  get esDelivery(): boolean {
    return this.tipoVenta === TipoVenta.DELIVERY;
  }

  get estaCompletada(): boolean {
    return this.estado === EstadoVenta.COMPLETADA;
  }

  get puedeAnularse(): boolean {
    return this.estado === EstadoVenta.COMPLETADA && 
           new Date().getTime() - this.fechaVenta.getTime() < 24 * 60 * 60 * 1000; // 24 horas
  }
}

