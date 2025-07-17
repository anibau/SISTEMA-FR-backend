import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

export enum EstadoCierre {
  ABIERTO = 'abierto',
  CERRADO = 'cerrado',
  REVISADO = 'revisado',
  APROBADO = 'aprobado',
}

export enum TipoMovimientoCaja {
  VENTA_EFECTIVO = 'venta_efectivo',
  VENTA_YAPE = 'venta_yape',
  VENTA_PLIN = 'venta_plin',
  VENTA_TRANSFERENCIA = 'venta_transferencia',
  GASTO = 'gasto',
  RETIRO = 'retiro',
  INGRESO_ADICIONAL = 'ingreso_adicional',
  AJUSTE_POSITIVO = 'ajuste_positivo',
  AJUSTE_NEGATIVO = 'ajuste_negativo',
}

@Entity('cierres_caja')
export class CierreCaja extends BaseEntity {
  @Column({ unique: true })
  numeroCierre: string;

  @Column()
  usuarioId: string; // Cajero responsable

  @Column()
  usuarioNombre: string;

  @Column({
    type: 'enum',
    enum: EstadoCierre,
    default: EstadoCierre.ABIERTO,
  })
  estado: EstadoCierre;

  // Fechas y horarios
  @Column({ type: 'timestamp' })
  fechaApertura: Date;

  @Column({ type: 'timestamp', nullable: true })
  fechaCierre?: Date;

  @Column({ type: 'time', nullable: true })
  horaApertura?: string;

  @Column({ type: 'time', nullable: true })
  horaCierre?: string;

  @Column({ type: 'int', nullable: true })
  minutosOperacion?: number;

  // Montos iniciales
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  montoInicialEfectivo: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  montoInicialYape: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  montoInicialPlin: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  montoInicialTransferencia: number;

  // Ventas del día
  @Column({ type: 'int', default: 0 })
  totalVentas: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalVentasEfectivo: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalVentasYape: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalVentasPlin: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalVentasTransferencia: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalVentasGeneral: number;

  // Gastos del día
  @Column({ type: 'int', default: 0 })
  totalGastos: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalMontoGastos: number;

  // Movimientos adicionales
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalRetiros: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalIngresosAdicionales: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalAjustes: number;

  // Cálculos finales
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  montoEsperadoEfectivo: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  montoEsperadoYape: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  montoEsperadoPlin: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  montoEsperadoTransferencia: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  montoEsperadoTotal: number;

  // Conteo físico
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  montoContadoEfectivo?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  montoContadoYape?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  montoContadoPlin?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  montoContadoTransferencia?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  montoContadoTotal?: number;

  // Diferencias
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  diferenciaEfectivo: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  diferenciaYape: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  diferenciaPlin: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  diferenciaTransferencia: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  diferenciaTotal: number;

  // Información adicional
  @Column({ type: 'text', nullable: true })
  observaciones?: string;

  @Column({ type: 'text', nullable: true })
  motivoDiferencia?: string;

  @Column({ nullable: true })
  supervisorId?: string; // Usuario que revisó/aprobó

  @Column({ nullable: true })
  supervisorNombre?: string;

  @Column({ type: 'timestamp', nullable: true })
  fechaRevision?: Date;

  @Column({ type: 'timestamp', nullable: true })
  fechaAprobacion?: Date;

  // Estadísticas adicionales
  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  ticketPromedio?: number;

  @Column({ type: 'int', nullable: true })
  clientesAtendidos?: number;

  @Column({ type: 'json', nullable: true })
  detalleVentas?: {
    ventaId: string;
    numeroTicket: string;
    monto: number;
    metodoPago: string;
    hora: string;
  }[];

  @Column({ type: 'json', nullable: true })
  detalleGastos?: {
    gastoId: string;
    descripcion: string;
    monto: number;
    categoria: string;
    hora: string;
  }[];

  // Relaciones
  // @ManyToOne(() => User, user => user.cierresCaja)
  // @JoinColumn({ name: 'usuarioId' })
  // usuario: User;

  // @ManyToOne(() => User, user => user.cierresSupervision)
  // @JoinColumn({ name: 'supervisorId' })
  // supervisor: User;

  // Métodos de utilidad
  get estaAbierto(): boolean {
    return this.estado === EstadoCierre.ABIERTO;
  }

  get estaCerrado(): boolean {
    return this.estado === EstadoCierre.CERRADO;
  }

  get tieneDesbalance(): boolean {
    return Math.abs(this.diferenciaTotal) > 0.01; // Tolerancia de 1 centavo
  }

  get desbalanceSignificativo(): boolean {
    return Math.abs(this.diferenciaTotal) > 5.00; // Más de 5 soles
  }

  get duracionTurno(): string {
    if (!this.minutosOperacion) return '0 min';
    
    const horas = Math.floor(this.minutosOperacion / 60);
    const minutos = this.minutosOperacion % 60;
    
    if (horas > 0) {
      return `${horas}h ${minutos}min`;
    }
    return `${minutos}min`;
  }

  calcularMontoEsperado(): void {
    this.montoEsperadoEfectivo = this.montoInicialEfectivo + this.totalVentasEfectivo - this.totalMontoGastos - this.totalRetiros + this.totalIngresosAdicionales + this.totalAjustes;
    this.montoEsperadoYape = this.montoInicialYape + this.totalVentasYape;
    this.montoEsperadoPlin = this.montoInicialPlin + this.totalVentasPlin;
    this.montoEsperadoTransferencia = this.montoInicialTransferencia + this.totalVentasTransferencia;
    
    this.montoEsperadoTotal = this.montoEsperadoEfectivo + this.montoEsperadoYape + this.montoEsperadoPlin + this.montoEsperadoTransferencia;
  }

  calcularDiferencias(): void {
    if (this.montoContadoEfectivo !== null && this.montoContadoEfectivo !== undefined) {
      this.diferenciaEfectivo = this.montoContadoEfectivo - this.montoEsperadoEfectivo;
    }
    
    if (this.montoContadoYape !== null && this.montoContadoYape !== undefined) {
      this.diferenciaYape = this.montoContadoYape - this.montoEsperadoYape;
    }
    
    if (this.montoContadoPlin !== null && this.montoContadoPlin !== undefined) {
      this.diferenciaPlin = this.montoContadoPlin - this.montoEsperadoPlin;
    }
    
    if (this.montoContadoTransferencia !== null && this.montoContadoTransferencia !== undefined) {
      this.diferenciaTransferencia = this.montoContadoTransferencia - this.montoEsperadoTransferencia;
    }
    
    this.diferenciaTotal = this.diferenciaEfectivo + this.diferenciaYape + this.diferenciaPlin + this.diferenciaTransferencia;
    
    if (this.montoContadoTotal !== null && this.montoContadoTotal !== undefined) {
      this.montoContadoTotal = (this.montoContadoEfectivo || 0) + (this.montoContadoYape || 0) + (this.montoContadoPlin || 0) + (this.montoContadoTransferencia || 0);
    }
  }

  cerrar(): void {
    if (this.estado !== EstadoCierre.ABIERTO) {
      throw new Error('Solo se pueden cerrar cajas abiertas');
    }
    
    this.estado = EstadoCierre.CERRADO;
    this.fechaCierre = new Date();
    this.horaCierre = new Date().toTimeString().slice(0, 5);
    
    if (this.fechaApertura) {
      this.minutosOperacion = Math.floor((this.fechaCierre.getTime() - this.fechaApertura.getTime()) / (1000 * 60));
    }
    
    this.calcularMontoEsperado();
    this.calcularDiferencias();
    
    if (this.totalVentas > 0) {
      this.ticketPromedio = this.totalVentasGeneral / this.totalVentas;
    }
  }

  revisar(supervisorId: string, supervisorNombre: string): void {
    if (this.estado !== EstadoCierre.CERRADO) {
      throw new Error('Solo se pueden revisar cajas cerradas');
    }
    
    this.estado = EstadoCierre.REVISADO;
    this.supervisorId = supervisorId;
    this.supervisorNombre = supervisorNombre;
    this.fechaRevision = new Date();
  }

  aprobar(supervisorId: string, supervisorNombre: string): void {
    if (this.estado !== EstadoCierre.REVISADO) {
      throw new Error('Solo se pueden aprobar cajas revisadas');
    }
    
    this.estado = EstadoCierre.APROBADO;
    this.supervisorId = supervisorId;
    this.supervisorNombre = supervisorNombre;
    this.fechaAprobacion = new Date();
  }

  agregarVenta(ventaId: string, numeroTicket: string, monto: number, metodoPago: string): void {
    if (!this.detalleVentas) {
      this.detalleVentas = [];
    }
    
    this.detalleVentas.push({
      ventaId,
      numeroTicket,
      monto,
      metodoPago,
      hora: new Date().toTimeString().slice(0, 5),
    });
    
    this.totalVentas += 1;
    this.totalVentasGeneral += monto;
    
    switch (metodoPago.toLowerCase()) {
      case 'efectivo':
        this.totalVentasEfectivo += monto;
        break;
      case 'yape':
        this.totalVentasYape += monto;
        break;
      case 'plin':
        this.totalVentasPlin += monto;
        break;
      case 'transferencia':
        this.totalVentasTransferencia += monto;
        break;
    }
  }

  agregarGasto(gastoId: string, descripcion: string, monto: number, categoria: string): void {
    if (!this.detalleGastos) {
      this.detalleGastos = [];
    }
    
    this.detalleGastos.push({
      gastoId,
      descripcion,
      monto,
      categoria,
      hora: new Date().toTimeString().slice(0, 5),
    });
    
    this.totalGastos += 1;
    this.totalMontoGastos += monto;
  }
}

@Entity('movimientos_caja')
export class MovimientoCaja extends BaseEntity {
  @Column()
  cierreCajaId: string;

  @Column({
    type: 'enum',
    enum: TipoMovimientoCaja,
  })
  tipo: TipoMovimientoCaja;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monto: number;

  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @Column({ nullable: true })
  referenciaId?: string; // ID de venta, gasto, etc.

  @Column({ nullable: true })
  numeroReferencia?: string; // Número de ticket, comprobante, etc.

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaMovimiento: Date;

  @Column({ nullable: true })
  usuarioId?: string;

  @Column({ type: 'json', nullable: true })
  metadatos?: {
    metodoPago?: string;
    cliente?: string;
    categoria?: string;
    observaciones?: string;
  };

  // Relaciones
  @ManyToOne(() => CierreCaja, cierre => cierre.id)
  @JoinColumn({ name: 'cierreCajaId' })
  cierreCaja: CierreCaja;

  // Métodos de utilidad
  get esIngreso(): boolean {
    return [
      TipoMovimientoCaja.VENTA_EFECTIVO,
      TipoMovimientoCaja.VENTA_YAPE,
      TipoMovimientoCaja.VENTA_PLIN,
      TipoMovimientoCaja.VENTA_TRANSFERENCIA,
      TipoMovimientoCaja.INGRESO_ADICIONAL,
      TipoMovimientoCaja.AJUSTE_POSITIVO,
    ].includes(this.tipo);
  }

  get esEgreso(): boolean {
    return [
      TipoMovimientoCaja.GASTO,
      TipoMovimientoCaja.RETIRO,
      TipoMovimientoCaja.AJUSTE_NEGATIVO,
    ].includes(this.tipo);
  }

  get montoConSigno(): number {
    return this.esIngreso ? this.monto : -this.monto;
  }
}

