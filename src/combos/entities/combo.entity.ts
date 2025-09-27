import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { ComboDetalle } from './combo-detalle.entity';

@Entity('combos')
export class Combo extends BaseEntity {
  @Column({ unique: true })
  codigo: string;

  @Column()
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precioCombo: number; // Alias para precio

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precioOriginal: number; // Suma de precios individuales

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  descuentoPorcentaje: number; // Porcentaje de descuento

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  descuento: number; // Alias para descuentoPorcentaje

  @Column({ nullable: true })
  imagen?: string;

  @Column({ default: true })
  esVisible: boolean;

  @Column({ default: false })
  esDestacado: boolean;

  @Column({ type: 'timestamp', nullable: true })
  fechaInicio?: Date;

  @Column({ type: 'timestamp', nullable: true })
  fechaFin?: Date;

  @Column({ default: 0 })
  totalVendido: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalIngresos: number;

  // Relación con productos del combo
  @OneToMany(() => ComboDetalle, detalle => detalle.combo, { cascade: true })
  detalles: ComboDetalle[];

  // Alias para compatibilidad con el servicio de catálogo
  get productos(): ComboDetalle[] {
    return this.detalles;
  }

  get estaDisponible(): boolean {
    return this.disponible;
  }

  // Métodos de utilidad
  get descuentoMonto(): number {
    return this.precioOriginal - this.precio;
  }

  get disponible(): boolean {
    return this.isActive && this.esVisible && this.estaEnVigencia;
  }

  get estaEnVigencia(): boolean {
    const ahora = new Date();
    const inicioValido = !this.fechaInicio || this.fechaInicio <= ahora;
    const finValido = !this.fechaFin || this.fechaFin >= ahora;
    return inicioValido && finValido;
  }

  calcularPrecioOriginal(): number {
    return this.detalles?.reduce((total, detalle) => {
      return total + (detalle.precioUnitario * detalle.cantidad);
    }, 0) || 0;
  }

  aplicarDescuento(porcentaje: number): void {
    this.descuentoPorcentaje = porcentaje;
    this.precio = this.precioOriginal * (1 - porcentaje / 100);
  }
}
