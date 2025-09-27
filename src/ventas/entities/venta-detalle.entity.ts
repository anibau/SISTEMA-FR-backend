import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Venta } from './venta.entity';
import { Producto } from '../../productos/entities/producto.entity';
import { Promocion } from '../../promociones/entities/promocion.entity';

@Entity('venta_detalles')
export class VentaDetalle {
  @ApiProperty({
    description: 'ID único del detalle de la venta',
    example: 'uuid-detalle',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Venta a la que pertenece este detalle',
    type: () => Venta,
  })
  @ManyToOne(() => Venta, (venta) => venta.detalles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'venta_id' })
  venta: Venta;

  @ApiProperty({
    description: 'ID de la venta',
    example: 'uuid-venta',
  })
  @Column({ name: 'venta_id' })
  ventaId: string;

  @ApiProperty({
    description: 'Producto vendido',
    type: () => Producto,
  })
  @ManyToOne(() => Producto, { eager: true })
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;

  @ApiProperty({
    description: 'ID del producto',
    example: 'uuid-producto',
  })
  @Column({ name: 'producto_id' })
  productoId: string;

  @ApiProperty({
    description: 'Promoción aplicada (opcional)',
    type: () => Promocion,
  })
  @ManyToOne(() => Promocion, { nullable: true })
  @JoinColumn({ name: 'promocion_id' })
  promocion?: Promocion;

  @ApiProperty({
    description: 'ID de la promoción aplicada',
    example: 'uuid-promocion',
  })
  @Column({ name: 'promocion_id', nullable: true })
  promocionId?: string;

  @ApiProperty({
    description: 'Cantidad vendida',
    example: 3,
  })
  @Column({ type: 'int' })
  cantidad: number;

  @ApiProperty({
    description: 'Precio unitario al momento de la venta',
    example: 25.50,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precioUnitario: number;

  @ApiProperty({
    description: 'Descuento aplicado al producto',
    example: 5.00,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  descuento: number;

  @ApiProperty({
    description: 'Subtotal del detalle (cantidad * precio unitario)',
    example: 76.50,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @ApiProperty({
    description: 'Fecha de creación del registro',
    example: '2024-01-15T10:30:00Z',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización del registro',
    example: '2024-01-15T10:30:00Z',
  })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ApiProperty({
    description: 'Indica si el registro está activo',
    example: true,
  })
  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}

