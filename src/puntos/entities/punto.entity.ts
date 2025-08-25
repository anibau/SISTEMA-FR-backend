import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

export enum TipoMovimientoPunto {
  GANADO = 'ganado',
  CANJEADO = 'canjeado',
  VENCIDO = 'vencido',
  AJUSTE_POSITIVO = 'ajuste_positivo',
  AJUSTE_NEGATIVO = 'ajuste_negativo',
  BONIFICACION = 'bonificacion',
  DEVOLUCION = 'devolucion',
}

export enum EstadoPunto {
  ACTIVO = 'activo',
  USADO = 'usado',
  VENCIDO = 'vencido',
  CANCELADO = 'cancelado',
}

@Entity('punto_movimientos')
export class PuntoMovimiento extends BaseEntity {
  @Column()
  clienteId: string;

  @Column({
    type: 'enum',
    enum: TipoMovimientoPunto,
  })
  tipo: TipoMovimientoPunto;

  @Column({ type: 'int' })
  puntos: number; // Positivo para ganados, negativo para usados

  @Column({ type: 'int' })
  saldoAnterior: number;

  @Column({ type: 'int' })
  saldoNuevo: number;

  @Column({
    type: 'enum',
    enum: EstadoPunto,
    default: EstadoPunto.ACTIVO,
  })
  estado: EstadoPunto;

  // Información de la transacción
  @Column({ nullable: true })
  ventaId?: string;

  @Column({ nullable: true })
  canjeId?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  montoCompra?: number; // Monto de compra que generó los puntos

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  valorCanje?: number; // Valor en soles del canje

  // Vencimiento
  @Column({ type: 'timestamp', nullable: true })
  fechaVencimiento?: Date;

  @Column({ default: false })
  esVencido: boolean;

  // Información adicional
  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @Column({ nullable: true })
  creadoPor?: string; // Usuario que realizó el movimiento

  @Column({ type: 'json', nullable: true })
  metadatos?: {
    origen: string; // pos, web, app
    dispositivo?: string;
    ubicacion?: string;
    promocionId?: string;
  };

  // Relaciones
  // @ManyToOne(() => Cliente, cliente => cliente.puntosMovimientos)
  // @JoinColumn({ name: 'clienteId' })
  // cliente: Cliente;

  // @ManyToOne(() => Venta, venta => venta.puntosMovimientos)
  // @JoinColumn({ name: 'ventaId' })
  // venta: Venta;

  // @ManyToOne(() => User, user => user.puntosMovimientos)
  // @JoinColumn({ name: 'creadoPor' })
  // usuario: User;

  // Métodos de utilidad
  get esPuntoGanado(): boolean {
    return this.puntos > 0;
  }

  get esPuntoUsado(): boolean {
    return this.puntos < 0;
  }

  get puntosAbsolutos(): number {
    return Math.abs(this.puntos);
  }

  verificarVencimiento(): boolean {
    if (!this.fechaVencimiento) return false;
    
    const ahora = new Date();
    const vencido = this.fechaVencimiento < ahora;
    
    if (vencido && !this.esVencido) {
      this.esVencido = true;
      this.estado = EstadoPunto.VENCIDO;
    }
    
    return vencido;
  }
}

@Entity('punto_canjes')
export class PuntoCanje extends BaseEntity {
  @Column()
  clienteId: string;

  @Column({ type: 'int' })
  puntosUsados: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valorSoles: number;

  @Column({ nullable: true })
  ventaId?: string; // Si se canjea en una venta

  @Column({ nullable: true })
  productoId?: string; // Si se canjea por un producto específico

  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @Column({ nullable: true })
  autorizadoPor?: string; // Usuario que autorizó el canje

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaCanje: Date;

  @Column({ default: false })
  esRevertido: boolean;

  @Column({ type: 'timestamp', nullable: true })
  fechaReversion?: Date;

  @Column({ nullable: true })
  revertidoPor?: string;

  @Column({ type: 'text', nullable: true })
  motivoReversion?: string;

  // Relaciones
  // @ManyToOne(() => Cliente, cliente => cliente.puntoCanjes)
  // @JoinColumn({ name: 'clienteId' })
  // cliente: Cliente;

  // @ManyToOne(() => Venta, venta => venta.puntoCanjes)
  // @JoinColumn({ name: 'ventaId' })
  // venta: Venta;

  // Métodos de utilidad
  get puedeRevertirse(): boolean {
    if (this.esRevertido) return false;
    
    // Solo se puede revertir dentro de las 24 horas
    const ahora = new Date();
    const limite = new Date(this.fechaCanje);
    limite.setHours(limite.getHours() + 24);
    
    return ahora <= limite;
  }

  revertir(usuarioId: string, motivo: string): void {
    if (!this.puedeRevertirse) {
      throw new Error('Este canje no puede ser revertido');
    }
    
    this.esRevertido = true;
    this.fechaReversion = new Date();
    this.revertidoPor = usuarioId;
    this.motivoReversion = motivo;
  }
}

@Entity('punto_configuraciones')
export class PuntoConfiguracion extends BaseEntity {
  @Column({ unique: true })
  clave: string;

  @Column()
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @Column({ type: 'json' })
  valor: any;

  @Column({ default: true })
  esActivo: boolean;

  @Column({ nullable: true })
  modificadoPor?: string;

  @Column({ type: 'timestamp', nullable: true })
  fechaModificacion?: Date;

  // Métodos de utilidad
  get valorNumerico(): number {
    return typeof this.valor === 'number' ? this.valor : parseFloat(this.valor);
  }

  get valorBooleano(): boolean {
    return typeof this.valor === 'boolean' ? this.valor : this.valor === 'true';
  }

  actualizarValor(nuevoValor: any, usuarioId?: string): void {
    this.valor = nuevoValor;
    this.modificadoPor = usuarioId;
    this.fechaModificacion = new Date();
  }
}

