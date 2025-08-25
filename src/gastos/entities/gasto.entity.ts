import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

export enum CategoriaGasto {
  SERVICIOS = 'servicios',
  TRANSPORTE = 'transporte',
  MANTENIMIENTO = 'mantenimiento',
  SUMINISTROS = 'suministros',
  MARKETING = 'marketing',
  PERSONAL = 'personal',
  IMPUESTOS = 'impuestos',
  SEGUROS = 'seguros',
  ALQUILER = 'alquiler',
  OTROS = 'otros',
}

export enum EstadoGasto {
  PENDIENTE = 'pendiente',
  APROBADO = 'aprobado',
  RECHAZADO = 'rechazado',
  PAGADO = 'pagado',
}

export enum TipoComprobante {
  BOLETA = 'boleta',
  FACTURA = 'factura',
  RECIBO = 'recibo',
  TICKET = 'ticket',
  NINGUNO = 'ninguno',
}

@Entity('gastos')
export class Gasto extends BaseEntity {
  @Column({ unique: true })
  numeroGasto: string;

  @Column()
  descripcion: string;

  @Column({
    type: 'enum',
    enum: CategoriaGasto,
  })
  categoria: CategoriaGasto;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monto: number;

  @Column({ type: 'date' })
  fechaGasto: Date;

  @Column({
    type: 'enum',
    enum: EstadoGasto,
    default: EstadoGasto.PENDIENTE,
  })
  estado: EstadoGasto;

  // Información del comprobante
  @Column({
    type: 'enum',
    enum: TipoComprobante,
    default: TipoComprobante.NINGUNO,
  })
  tipoComprobante: TipoComprobante;

  @Column({ nullable: true })
  numeroComprobante?: string;

  @Column({ nullable: true })
  rucProveedor?: string;

  @Column({ nullable: true })
  nombreProveedor?: string;

  @Column({ type: 'date', nullable: true })
  fechaComprobante?: Date;

  // Información del usuario
  @Column()
  usuarioId: string; // Usuario que registró el gasto

  @Column()
  usuarioNombre: string;

  @Column({ nullable: true })
  aprobadoPor?: string; // Usuario que aprobó el gasto

  @Column({ nullable: true })
  nombreAprobador?: string;

  @Column({ type: 'timestamp', nullable: true })
  fechaAprobacion?: Date;

  // Información adicional
  @Column({ type: 'text', nullable: true })
  observaciones?: string;

  @Column({ type: 'text', nullable: true })
  motivoRechazo?: string;

  @Column({ default: false })
  esRecurrente: boolean;

  @Column({ type: 'int', nullable: true })
  diaRecurrencia?: number; // Día del mes para gastos recurrentes

  // Archivos adjuntos
  @Column({ type: 'json', nullable: true })
  archivosAdjuntos?: {
    nombre: string;
    url: string;
    tipo: string;
    tamaño: number;
  }[];

  // Información de pago
  @Column({ type: 'date', nullable: true })
  fechaPago?: Date;

  @Column({ nullable: true })
  metodoPago?: string; // efectivo, transferencia, cheque, etc.

  @Column({ nullable: true })
  numeroOperacion?: string;

  @Column({ nullable: true })
  cierreCajaId?: string; // Si se pagó desde caja

  // Información contable
  @Column({ nullable: true })
  cuentaContable?: string;

  @Column({ nullable: true })
  centroCosto?: string;

  @Column({ type: 'int', nullable: true })
  mes?: number; // Mes al que corresponde el gasto

  @Column({ type: 'int', nullable: true })
  año?: number; // Año al que corresponde el gasto

  // Relaciones
  // @ManyToOne(() => User, user => user.gastos)
  // @JoinColumn({ name: 'usuarioId' })
  // usuario: User;

  // @ManyToOne(() => User, user => user.gastosAprobados)
  // @JoinColumn({ name: 'aprobadoPor' })
  // aprobador: User;

  // @ManyToOne(() => CierreCaja, cierre => cierre.gastos)
  // @JoinColumn({ name: 'cierreCajaId' })
  // cierreCaja: CierreCaja;

  // Métodos de utilidad
  get estaPendiente(): boolean {
    return this.estado === EstadoGasto.PENDIENTE;
  }

  get estaAprobado(): boolean {
    return this.estado === EstadoGasto.APROBADO;
  }

  get estaRechazado(): boolean {
    return this.estado === EstadoGasto.RECHAZADO;
  }

  get estaPagado(): boolean {
    return this.estado === EstadoGasto.PAGADO;
  }

  get puedeModificar(): boolean {
    return this.estado === EstadoGasto.PENDIENTE;
  }

  get puedeAprobar(): boolean {
    return this.estado === EstadoGasto.PENDIENTE;
  }

  get puedePagar(): boolean {
    return this.estado === EstadoGasto.APROBADO;
  }

  get tieneComprobante(): boolean {
    return this.tipoComprobante !== TipoComprobante.NINGUNO && !!this.numeroComprobante;
  }

  get diasVencimiento(): number {
    if (!this.fechaGasto) return 0;
    
    const hoy = new Date();
    const fechaGasto = new Date(this.fechaGasto);
    const diferencia = hoy.getTime() - fechaGasto.getTime();
    
    return Math.floor(diferencia / (1000 * 60 * 60 * 24));
  }

  get estaVencido(): boolean {
    return this.diasVencimiento > 30 && !this.estaPagado;
  }

  aprobar(aprobadorId: string, nombreAprobador: string): void {
    if (!this.puedeAprobar) {
      throw new Error('Este gasto no puede ser aprobado');
    }
    
    this.estado = EstadoGasto.APROBADO;
    this.aprobadoPor = aprobadorId;
    this.nombreAprobador = nombreAprobador;
    this.fechaAprobacion = new Date();
  }

  rechazar(aprobadorId: string, nombreAprobador: string, motivo: string): void {
    if (!this.puedeAprobar) {
      throw new Error('Este gasto no puede ser rechazado');
    }
    
    this.estado = EstadoGasto.RECHAZADO;
    this.aprobadoPor = aprobadorId;
    this.nombreAprobador = nombreAprobador;
    this.fechaAprobacion = new Date();
    this.motivoRechazo = motivo;
  }

  marcarComoPagado(metodoPago: string, numeroOperacion?: string, cierreCajaId?: string): void {
    if (!this.puedePagar) {
      throw new Error('Este gasto no puede ser marcado como pagado');
    }
    
    this.estado = EstadoGasto.PAGADO;
    this.fechaPago = new Date();
    this.metodoPago = metodoPago;
    this.numeroOperacion = numeroOperacion;
    this.cierreCajaId = cierreCajaId;
  }

  agregarArchivo(nombre: string, url: string, tipo: string, tamaño: number): void {
    if (!this.archivosAdjuntos) {
      this.archivosAdjuntos = [];
    }
    
    this.archivosAdjuntos.push({
      nombre,
      url,
      tipo,
      tamaño,
    });
  }

  removerArchivo(nombre: string): void {
    if (this.archivosAdjuntos) {
      this.archivosAdjuntos = this.archivosAdjuntos.filter(archivo => archivo.nombre !== nombre);
    }
  }

  calcularMesAño(): void {
    if (this.fechaGasto) {
      const fecha = new Date(this.fechaGasto);
      this.mes = fecha.getMonth() + 1;
      this.año = fecha.getFullYear();
    }
  }
}

