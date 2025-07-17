import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ProductoPromocionDto {
  @ApiProperty({
    description: 'ID del producto',
    example: 'uuid-producto-1',
  })
  @IsString({ message: 'El ID del producto debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El ID del producto es requerido' })
  productoId: string;

  @ApiProperty({
    description: 'Cantidad del producto',
    example: 2,
    minimum: 1,
  })
  @IsNumber({}, { message: 'La cantidad debe ser un número' })
  @Min(1, { message: 'La cantidad debe ser mayor a 0' })
  @Type(() => Number)
  cantidad: number;

  @ApiProperty({
    description: 'Precio unitario del producto',
    example: 25.50,
    minimum: 0,
  })
  @IsNumber({}, { message: 'El precio debe ser un número' })
  @Min(0, { message: 'El precio no puede ser negativo' })
  @Type(() => Number)
  precio: number;

  @ApiPropertyOptional({
    description: 'Categoría del producto',
    example: 'Vinos',
  })
  @IsOptional()
  @IsString({ message: 'La categoría debe ser una cadena de texto' })
  categoria?: string;

  @ApiPropertyOptional({
    description: 'Marca del producto',
    example: 'Marca Premium',
  })
  @IsOptional()
  @IsString({ message: 'La marca debe ser una cadena de texto' })
  marca?: string;
}

export class AplicarPromocionDto {
  @ApiProperty({
    description: 'ID de la promoción a aplicar',
    example: 'uuid-promocion-1',
  })
  @IsString({ message: 'El ID de la promoción debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El ID de la promoción es requerido' })
  promocionId: string;

  @ApiPropertyOptional({
    description: 'ID del cliente (opcional)',
    example: 'uuid-cliente-1',
  })
  @IsOptional()
  @IsString({ message: 'El ID del cliente debe ser una cadena de texto' })
  clienteId?: string;

  @ApiProperty({
    description: 'Productos en el carrito',
    type: [ProductoPromocionDto],
  })
  @IsArray({ message: 'Los productos deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => ProductoPromocionDto)
  productos: ProductoPromocionDto[];

  @ApiPropertyOptional({
    description: 'Código promocional (si se requiere)',
    example: 'CUMPLE2024',
  })
  @IsOptional()
  @IsString({ message: 'El código promocional debe ser una cadena de texto' })
  codigoPromocional?: string;

  @ApiPropertyOptional({
    description: 'Tipo de venta (mostrador/delivery)',
    example: 'mostrador',
  })
  @IsOptional()
  @IsString({ message: 'El tipo de venta debe ser una cadena de texto' })
  tipoVenta?: string;
}

export class ValidarPromocionDto {
  @ApiProperty({
    description: 'Código de la promoción o ID',
    example: 'PROMO001',
  })
  @IsString({ message: 'El código debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El código es requerido' })
  codigo: string;

  @ApiPropertyOptional({
    description: 'ID del cliente (opcional)',
    example: 'uuid-cliente-1',
  })
  @IsOptional()
  @IsString({ message: 'El ID del cliente debe ser una cadena de texto' })
  clienteId?: string;

  @ApiPropertyOptional({
    description: 'Monto total de la compra',
    example: 100.50,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El monto debe ser un número' })
  @Min(0, { message: 'El monto no puede ser negativo' })
  @Type(() => Number)
  montoTotal?: number;

  @ApiPropertyOptional({
    description: 'Cantidad total de productos',
    example: 3,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: 'La cantidad debe ser un número' })
  @Min(1, { message: 'La cantidad debe ser mayor a 0' })
  @Type(() => Number)
  cantidadTotal?: number;
}

