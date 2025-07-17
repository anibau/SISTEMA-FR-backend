import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

export enum TipoDocumento {
  DNI = 'dni',
  CE = 'ce',
  PASAPORTE = 'pasaporte',
  RUC = 'ruc',
}

export enum EstadoCliente {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
  BLOQUEADO = 'bloqueado',
}

@Entity('clientes')
export class Cliente extends BaseEntity {
  @Column()
  nombres: string;

  @Column()
  apellidos: string;

  @Column({
    type: 'enum',
    enum: TipoDocumento,
    default: TipoDocumento.DNI,
  })
  tipoDocumento: TipoDocumento;

  @Column({ unique: true })
  numeroDocumento: string;

  @Column({ unique: true })
  telefono: string;

  @Column({ unique: true, nullable: true })
  email?: string;

  @Column({ type: 'date', nullable: true })
  fechaNacimiento?: Date;

  @Column({ nullable: true })
  direccion?: string;

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

  // Sistema de puntos
  @Column({ type: 'int', default: 0 })
  puntosAcumulados: number;

  @Column({ type: 'int', default: 0 })
  puntosUsados: number;

  @Column({ type: 'int', default: 0 })
  puntosCanjeados: number;

  // Estadísticas de compras
  @Column({ type: 'int', default: 0 })
  totalCompras: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  montoTotalCompras: number;

  @Column({ type: 'timestamp', nullable: true })
  ultimaCompra?: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  promedioCompra: number;

  // Sistema de fiado
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  limiteCredito: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  deudaActual: number;

  @Column({ default: true })
  puedeComprarFiado: boolean;

  // Estado y preferencias
  @Column({
    type: 'enum',
    enum: EstadoCliente,
    default: EstadoCliente.ACTIVO,
  })
  estado: EstadoCliente;

  @Column({ default: true })
  recibeNotificaciones: boolean;

  @Column({ default: true })
  recibePromociones: boolean;

  @Column({ type: 'json', nullable: true })
  preferencias?: {
    categoriasFavoritas: string[];
    marcasFavoritas: string[];
    horarioPreferido: string;
    metodoPagoPreferido: string;
  };

  // Información adicional
  @Column({ type: 'text', nullable: true })
  observaciones?: string;

  @Column({ type: 'json', nullable: true })
  metadatos?: {
    origenRegistro: string; // whatsapp, pos, web
    vendedorRegistro: string;
    fechaValidacion: Date;
    validadoPor: string;
  };

  // Relaciones
  // @OneToMany(() => Venta, venta => venta.cliente)
  // ventas: Venta[];

  // @OneToMany(() => Fiado, fiado => fiado.cliente)
  // fiados: Fiado[];

  // @OneToMany(() => PuntoMovimiento, movimiento => movimiento.cliente)
  // puntosMovimientos: PuntoMovimiento[];

  // Métodos de utilidad
  get nombreCompleto(): string {
    return `${this.nombres} ${this.apellidos}`;
  }

  get puntosDisponibles(): number {
    return this.puntosAcumulados - this.puntosUsados;
  }

  get creditoDisponible(): number {
    return this.limiteCredito - this.deudaActual;
  }

  get esCumpleanos(): boolean {
    if (!this.fechaNacimiento) return false;
    
    const hoy = new Date();
    const cumple = new Date(this.fechaNacimiento);
    
    return hoy.getMonth() === cumple.getMonth() && 
           hoy.getDate() === cumple.getDate();
  }

  get edad(): number | null {
    if (!this.fechaNacimiento) return null;
    
    const hoy = new Date();
    const nacimiento = new Date(this.fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    
    const mesActual = hoy.getMonth();
    const mesNacimiento = nacimiento.getMonth();
    
    if (mesActual < mesNacimiento || 
        (mesActual === mesNacimiento && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    
    return edad;
  }

  get nivelFidelidad(): string {
    if (this.totalCompras >= 50) return 'VIP';
    if (this.totalCompras >= 20) return 'Premium';
    if (this.totalCompras >= 5) return 'Regular';
    return 'Nuevo';
  }

  actualizarEstadisticas(montoCompra: number, puntosGanados: number): void {
    this.totalCompras += 1;
    this.montoTotalCompras += montoCompra;
    this.ultimaCompra = new Date();
    this.promedioCompra = this.montoTotalCompras / this.totalCompras;
    this.puntosAcumulados += puntosGanados;
  }

  usarPuntos(puntos: number): boolean {
    if (this.puntosDisponibles >= puntos) {
      this.puntosUsados += puntos;
      return true;
    }
    return false;
  }

  aumentarDeuda(monto: number): boolean {
    if (this.creditoDisponible >= monto && this.puedeComprarFiado) {
      this.deudaActual += monto;
      return true;
    }
    return false;
  }

  pagarDeuda(monto: number): void {
    this.deudaActual = Math.max(0, this.deudaActual - monto);
  }
}

