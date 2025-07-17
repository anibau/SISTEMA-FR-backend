import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('productos')
export class Producto extends BaseEntity {
  @Column({ unique: true })
  codigo: string;

  @Column()
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  precioCompra?: number;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ type: 'int', default: 0 })
  stockMinimo: number;

  @Column({ nullable: true })
  categoria: string;

  @Column({ nullable: true })
  marca: string;

  @Column({ nullable: true })
  unidadMedida: string; // ml, L, unidad, etc.

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  contenido?: number; // 750ml, 1L, etc.

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  gradoAlcoholico?: number;

  @Column({ nullable: true })
  paisOrigen?: string;

  @Column({ nullable: true })
  proveedor?: string;

  @Column({ nullable: true })
  codigoBarras?: string;

  @Column({ nullable: true })
  imagen?: string;

  @Column({ type: 'json', nullable: true })
  imagenes?: string[]; // Array de URLs de imágenes

  // Flags especiales
  @Column({ default: false })
  esBonificado: boolean; // No genera puntos

  @Column({ default: true })
  habilitaPuntos: boolean; // Genera puntos al cliente

  @Column({ default: false })
  esDestacado: boolean; // Aparece en destacados

  @Column({ default: true })
  esVisible: boolean; // Visible en catálogo

  @Column({ default: false })
  requiereEdadMinima: boolean; // Verificar edad

  @Column({ default: 18 })
  edadMinima: number;

  // Información adicional
  @Column({ type: 'json', nullable: true })
  caracteristicas?: {
    color?: string;
    aroma?: string;
    sabor?: string;
    maridaje?: string[];
    temperatura?: string;
    ocasion?: string[];
  };

  @Column({ type: 'json', nullable: true })
  promociones?: {
    descuento?: number;
    fechaInicio?: Date;
    fechaFin?: Date;
    activa?: boolean;
  };

  // Estadísticas
  @Column({ default: 0 })
  totalVendido: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalIngresos: number;

  @Column({ type: 'timestamp', nullable: true })
  ultimaVenta?: Date;

  @Column({ type: 'timestamp', nullable: true })
  ultimaActualizacionStock?: Date;

  // Historial de precios (se puede implementar como entidad separada)
  @Column({ type: 'json', nullable: true })
  historialPrecios?: {
    precio: number;
    fecha: Date;
    usuario: string;
    motivo?: string;
  }[];

  // Relaciones (se implementarán según sea necesario)
  // @OneToMany(() => VentaDetalle, ventaDetalle => ventaDetalle.producto)
  // ventaDetalles: VentaDetalle[];

  // @OneToMany(() => ComboDetalle, comboDetalle => comboDetalle.producto)
  // comboDetalles: ComboDetalle[];

  // Métodos de utilidad
  get margenGanancia(): number {
    if (!this.precioCompra) return 0;
    return ((this.precio - this.precioCompra) / this.precioCompra) * 100;
  }

  get stockBajo(): boolean {
    return this.stock <= this.stockMinimo;
  }

  get disponible(): boolean {
    return this.stock > 0 && this.isActive && this.esVisible;
  }

  actualizarStock(cantidad: number, motivo?: string): void {
    this.stock += cantidad;
    this.ultimaActualizacionStock = new Date();
    
    if (cantidad < 0) {
      this.totalVendido += Math.abs(cantidad);
      this.ultimaVenta = new Date();
    }
  }

  aplicarDescuento(porcentaje: number): number {
    return this.precio * (1 - porcentaje / 100);
  }
}

