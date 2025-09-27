import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
  IsUUID,
  IsBoolean,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateComboDetalleDto {
  @ApiProperty({
    description: 'ID del producto',
    example: 'uuid-producto',
  })
  @IsNotEmpty()
  @IsUUID()
  productoId: string;

  @ApiProperty({
    description: 'Cantidad del producto en el combo',
    example: 2,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  cantidad: number;

  @ApiProperty({
    description: 'Precio unitario del producto al momento de crear el combo',
    example: 25.50,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  precioUnitario: number;
}

export class CreateComboDto {
  @ApiProperty({
    description: 'Código único del combo',
    example: 'COMBO001',
  })
  @IsNotEmpty()
  @IsString()
  codigo: string;

  @ApiProperty({
    description: 'Nombre del combo',
    example: 'Combo Cerveza + Piqueo',
  })
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @ApiPropertyOptional({
    description: 'Descripción del combo',
    example: '2 cervezas + 1 piqueo especial',
  })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty({
    description: 'Precio final del combo',
    example: 45.00,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  precio: number;

  @ApiProperty({
    description: 'Precio original (suma de productos individuales)',
    example: 55.00,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  precioOriginal: number;

  @ApiProperty({
    description: 'Porcentaje de descuento aplicado',
    example: 18.18,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  descuentoPorcentaje: number;

  @ApiPropertyOptional({
    description: 'URL de la imagen del combo',
    example: 'https://example.com/combo.jpg',
  })
  @IsOptional()
  @IsString()
  imagen?: string;

  @ApiPropertyOptional({
    description: 'Si el combo es visible en el catálogo',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  esVisible?: boolean;

  @ApiPropertyOptional({
    description: 'Si el combo es destacado',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  esDestacado?: boolean;

  @ApiPropertyOptional({
    description: 'Fecha de inicio de vigencia',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @ApiPropertyOptional({
    description: 'Fecha de fin de vigencia',
    example: '2024-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @ApiProperty({
    description: 'Productos incluidos en el combo',
    type: [CreateComboDetalleDto],
  })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateComboDetalleDto)
  detalles: CreateComboDetalleDto[];
}

