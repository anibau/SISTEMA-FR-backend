import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

export enum TipoPromocion {
  DESCUENTO_PORCENTAJE = 'descuento_porcentaje',
  DESCUENTO_MONTO = 'descuento_monto',
  PRODUCTO_GRATIS = 'producto_gratis',
  COMBO_ESPECIAL = 'combo_especial',
  CUMPLEANOS = 'cumpleanos',
  PRIMERA_COMPRA = 'primera_compra',
  CANTIDAD_MINIMA = 'cantidad_minima',
  MONTO_MINIMO = 'monto_minimo',
}

export enum EstadoPromocion {
  ACTIVA = 'activa',
  INACTIVA = 'inactiva',
  PAUSADA = 'pausada',
  VENCIDA = 'vencida',
}

export enum DiaSemana {
  LUNES = 'lunes',
  MARTES = 'martes',
  MIERCOLES = 'miercoles',
  JUEVES = 'jueves',
  VIERNES = 'viernes',
  SABADO = 'sabado',
  DOMINGO = 'domingo',
}

@Entity('promociones')
export class Promocion extends BaseEntity {
  @Column({ unique: true })
  codigo: string;

  @Column()
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @Column({
    type: 'enum',
    enum: TipoPromocion,
  })
  tipo: TipoPromocion;

  @Column({
    type: 'enum',
    enum: EstadoPromocion,
    default: EstadoPromocion.ACTIVA,
  })
  estado: EstadoPromocion;

  // Configuración del descuento
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  descuentoPorcentaje?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  descuentoMonto?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  montoMinimo?: number;

  @Column({ type: 'int', nullable: true })
  cantidadMinima?: number;

  // Vigencia
  @Column({ type: 'timestamp' })
  fechaInicio: Date;

  @Column({ type: 'timestamp' })
  fechaFin: Date;

  @Column({ type: 'time', nullable: true })
  horaInicio?: string;

  @Column({ type: 'time', nullable: true })
  horaFin?: string;

  @Column({ type: 'json', nullable: true })
  diasSemana?: DiaSemana[];

  // Limitaciones
  @Column({ type: 'int', nullable: true })
  usoMaximo?: number; // Máximo de usos totales

  @Column({ type: 'int', default: 0 })
  usoActual: number; // Usos actuales

  @Column({ type: 'int', nullable: true })
  usoMaximoPorCliente?: number; // Máximo por cliente

  // Aplicabilidad
  @Column({ type: 'json', nullable: true })
  categoriasAplicables?: string[]; // IDs de categorías

  @Column({ type: 'json', nullable: true })
  productosAplicables?: string[]; // IDs de productos específicos

  @Column({ type: 'json', nullable: true })
  productosExcluidos?: string[]; // IDs de productos excluidos

  @Column({ type: 'json', nullable: true })
  marcasAplicables?: string[]; // Marcas aplicables

  // Configuración especial
  @Column({ default: false })
  aplicaEnDelivery: boolean;

  @Column({ default: true })
  aplicaEnMostrador: boolean;

  @Column({ default: false })
  requiereCodigoPromocional: boolean;

  @Column({ nullable: true })
  codigoPromocional?: string;

  @Column({ default: false })
  esCumulable: boolean; // Se puede combinar con otras promociones

  // Estadísticas
  @Column({ type: 'int', default: 0 })
  totalVentas: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalDescuentoOtorgado: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalVentasGeneradas: number;

  // Información adicional
  @Column({ nullable: true })
  creadoPor?: string;

  @Column({ type: 'text', nullable: true })
  observaciones?: string;

  // Relaciones
  @OneToMany(() => PromocionUso, uso => uso.promocion)
  usos: PromocionUso[];

  // Métodos de utilidad
  get estaVigente(): boolean {
    const ahora = new Date();
    return this.estado === EstadoPromocion.ACTIVA &&
           this.fechaInicio <= ahora &&
           this.fechaFin >= ahora &&
           this.verificarHorario() &&
           this.verificarDiaSemana() &&
           !this.haAlcanzadoLimiteUso;
  }

  get haAlcanzadoLimiteUso(): boolean {
    return this.usoMaximo ? this.usoActual >= this.usoMaximo : false;
  }

  private verificarHorario(): boolean {
    if (!this.horaInicio || !this.horaFin) return true;
    
    const ahora = new Date();
    const horaActual = ahora.toTimeString().slice(0, 5);
    
    return horaActual >= this.horaInicio && horaActual <= this.horaFin;
  }

  private verificarDiaSemana(): boolean {
    if (!this.diasSemana || this.diasSemana.length === 0) return true;
    
    const diasMap = {
      0: DiaSemana.DOMINGO,
      1: DiaSemana.LUNES,
      2: DiaSemana.MARTES,
      3: DiaSemana.MIERCOLES,
      4: DiaSemana.JUEVES,
      5: DiaSemana.VIERNES,
      6: DiaSemana.SABADO,
    };
    
    const diaActual = diasMap[new Date().getDay()];
    return this.diasSemana.includes(diaActual);
  }

  calcularDescuento(montoBase: number, cantidad: number = 1): number {
    if (!this.estaVigente) return 0;

    // Verificar monto mínimo
    if (this.montoMinimo && montoBase < this.montoMinimo) return 0;

    // Verificar cantidad mínima
    if (this.cantidadMinima && cantidad < this.cantidadMinima) return 0;

    switch (this.tipo) {
      case TipoPromocion.DESCUENTO_PORCENTAJE:
        return montoBase * (this.descuentoPorcentaje / 100);
      
      case TipoPromocion.DESCUENTO_MONTO:
        return Math.min(this.descuentoMonto, montoBase);
      
      case TipoPromocion.CUMPLEANOS:
        return montoBase * (this.descuentoPorcentaje / 100);
      
      default:
        return 0;
    }
  }

  puedeUsarCliente(clienteId: string, usosCliente: number): boolean {
    if (!this.estaVigente) return false;
    
    if (this.usoMaximoPorCliente && usosCliente >= this.usoMaximoPorCliente) {
      return false;
    }
    
    return true;
  }

  registrarUso(ventaId: string, clienteId?: string, montoDescuento?: number): void {
    this.usoActual += 1;
    if (montoDescuento) {
      this.totalDescuentoOtorgado += montoDescuento;
    }
    this.totalVentas += 1;
  }
}

@Entity('promocion_usos')
export class PromocionUso extends BaseEntity {
  @Column()
  promocionId: string;

  @Column()
  ventaId: string;

  @Column({ nullable: true })
  clienteId?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  montoDescuento: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaUso: Date;

  @Column({ nullable: true })
  codigoUsado?: string;

  // Relaciones
  @ManyToOne(() => Promocion, promocion => promocion.usos)
  @JoinColumn({ name: 'promocionId' })
  promocion: Promocion;

  // @ManyToOne(() => Venta, venta => venta.promocionesUsadas)
  // @JoinColumn({ name: 'ventaId' })
  // venta: Venta;

  // @ManyToOne(() => Cliente, cliente => cliente.promocionesUsadas)
  // @JoinColumn({ name: 'clienteId' })
  // cliente: Cliente;
}
