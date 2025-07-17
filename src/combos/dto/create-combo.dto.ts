import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsPositive,
  Min,
  Max,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ComboDetalleDto {
  @ApiProperty({
    description: 'ID del producto',
    example: 'uuid-producto-1',
  })
  @IsString({ message: 'El ID del producto debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El ID del producto es requerido' })
  productoId: string;

  @ApiProperty({
    description: 'Cantidad del producto en el combo',
    example: 2,
    minimum: 1,
  })
  @IsNumber({}, { message: 'La cantidad debe ser un número' })
  @IsPositive({ message: 'La cantidad debe ser mayor a 0' })
  @Type(() => Number)
  cantidad: number;
}

export class CreateComboDto {
  @ApiProperty({
    description: 'Código único del combo',
    example: 'COMBO001',
  })
  @IsString({ message: 'El código debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El código es requerido' })
  codigo: string;

  @ApiProperty({
    description: 'Nombre del combo',
    example: 'Pack Vinos Premium',
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre: string;

  @ApiPropertyOptional({
    description: 'Descripción del combo',
    example: 'Selección especial de vinos tintos y blancos',
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  descripcion?: string;

  @ApiProperty({
    description: 'Porcentaje de descuento del combo',
    example: 15,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber({}, { message: 'El descuento debe ser un número' })
  @Min(0, { message: 'El descuento no puede ser negativo' })
  @Max(100, { message: 'El descuento no puede ser mayor a 100%' })
  @Type(() => Number)
  descuentoPorcentaje: number;

  @ApiPropertyOptional({
    description: 'URL de la imagen del combo',
    example: 'https://example.com/combo.jpg',
  })
  @IsOptional()
  @IsString({ message: 'La imagen debe ser una cadena de texto' })
  imagen?: string;

  @ApiPropertyOptional({
    description: 'Indica si el combo es visible',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'esVisible debe ser un valor booleano' })
  esVisible?: boolean;

  @ApiPropertyOptional({
    description: 'Indica si el combo es destacado',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'esDestacado debe ser un valor booleano' })
  esDestacado?: boolean;

  @ApiPropertyOptional({
    description: 'Fecha de inicio de vigencia del combo',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de inicio debe ser una fecha válida' })
  fechaInicio?: Date;

  @ApiPropertyOptional({
    description: 'Fecha de fin de vigencia del combo',
    example: '2024-12-31T23:59:59.000Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de fin debe ser una fecha válida' })
  fechaFin?: Date;

  @ApiProperty({
    description: 'Productos que componen el combo',
    type: [ComboDetalleDto],
    example: [
      { productoId: 'uuid-producto-1', cantidad: 2 },
      { productoId: 'uuid-producto-2', cantidad: 1 },
    ],
  })
  @IsArray({ message: 'Los detalles deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => ComboDetalleDto)
  detalles: ComboDetalleDto[];
}

