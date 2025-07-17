import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

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

  @Column()
  vendedorId: string;

  @Column({ nullable: true })
  clienteId?: string;

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
  descuento: number;

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
  puntosGanados: number;

  @Column({ type: 'int', default: 0 })
  puntosUsados: number;

  @Column({ type: 'json', nullable: true })
  promocionesAplicadas?: {
    id: string;
    nombre: string;
    descuento: number;
    tipo: string;
  }[];

  // Información adicional
  @Column({ type: 'text', nullable: true })
  observaciones?: string;

  @Column({ type: 'json', nullable: true })
  metadatos?: {
    ip?: string;
    userAgent?: string;
    dispositivo?: string;
    ubicacion?: string;
  };

  // Relaciones
  @OneToMany(() => VentaDetalle, detalle => detalle.venta, { cascade: true })
  detalles: VentaDetalle[];

  // @ManyToOne(() => User, user => user.ventas)
  // @JoinColumn({ name: 'vendedorId' })
  // vendedor: User;

  // @ManyToOne(() => Cliente, cliente => cliente.ventas)
  // @JoinColumn({ name: 'clienteId' })
  // cliente: Cliente;

  // Métodos de utilidad
  calcularTotales(): void {
    this.subtotal = this.detalles?.reduce((sum, detalle) => sum + detalle.subtotal, 0) || 0;
    this.total = this.subtotal - this.descuento + this.impuestos + this.costoDelivery;
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

@Entity('venta_detalles')
export class VentaDetalle extends BaseEntity {
  @Column()
  ventaId: string;

  @Column()
  productoId: string;

  @Column({ nullable: true })
  comboId?: string;

  @Column()
  nombre: string; // Nombre del producto/combo al momento de la venta

  @Column({ type: 'int' })
  cantidad: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precioUnitario: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  descuentoPorcentaje: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  descuentoMonto: number;

  @Column({ default: false })
  esBonificado: boolean;

  @Column({ default: true })
  generaPuntos: boolean;

  // Relaciones
  @ManyToOne(() => Venta, venta => venta.detalles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ventaId' })
  venta: Venta;

  // @ManyToOne(() => Producto, producto => producto.ventaDetalles)
  // @JoinColumn({ name: 'productoId' })
  // producto: Producto;

  // @ManyToOne(() => Combo, combo => combo.ventaDetalles)
  // @JoinColumn({ name: 'comboId' })
  // combo: Combo;

  // Métodos de utilidad
  calcularSubtotal(): void {
    const subtotalBase = this.cantidad * this.precioUnitario;
    this.subtotal = subtotalBase - this.descuentoMonto;
  }

  aplicarDescuento(porcentaje: number): void {
    this.descuentoPorcentaje = porcentaje;
    this.descuentoMonto = (this.cantidad * this.precioUnitario) * (porcentaje / 100);
    this.calcularSubtotal();
  }
}

