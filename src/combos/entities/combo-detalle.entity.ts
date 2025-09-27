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
import { Combo } from './combo.entity';
import { Producto } from '../../productos/entities/producto.entity';

@Entity('combo_detalles')
export class ComboDetalle {
  @ApiProperty({
    description: 'ID único del detalle del combo',
    example: 'uuid-detalle',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Combo al que pertenece este detalle',
    type: () => Combo,
  })
  @ManyToOne(() => Combo, (combo) => combo.detalles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'combo_id' })
  combo: Combo;

  @ApiProperty({
    description: 'ID del combo',
    example: 'uuid-combo',
  })
  @Column({ name: 'combo_id' })
  comboId: string;

  @ApiProperty({
    description: 'Producto incluido en el combo',
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
    description: 'Cantidad del producto en el combo',
    example: 2,
  })
  @Column({ type: 'int' })
  cantidad: number;

  @ApiProperty({
    description: 'Precio unitario del producto al momento de crear el combo',
    example: 25.50,
  })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precioUnitario: number;

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

