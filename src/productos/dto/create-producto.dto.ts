import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  IsObject,
  Min,
  Max,
  IsPositive,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateProductoDto {
  @ApiProperty({
    description: 'Código único del producto',
    example: 'WINE001',
  })
  @IsString({ message: 'El código debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El código es requerido' })
  codigo: string;

  @ApiProperty({
    description: 'Nombre del producto',
    example: 'Vino Tinto Reserva Cabernet Sauvignon',
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre: string;

  @ApiPropertyOptional({
    description: 'Descripción detallada del producto',
    example: 'Vino tinto de alta calidad con notas frutales y taninos suaves',
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  descripcion?: string;

  @ApiProperty({
    description: 'Precio de venta del producto',
    example: 45.50,
    minimum: 0,
  })
  @IsNumber({}, { message: 'El precio debe ser un número' })
  @IsPositive({ message: 'El precio debe ser mayor a 0' })
  @Type(() => Number)
  precio: number;

  @ApiPropertyOptional({
    description: 'Precio de compra del producto',
    example: 30.00,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El precio de compra debe ser un número' })
  @IsPositive({ message: 'El precio de compra debe ser mayor a 0' })
  @Type(() => Number)
  precioCompra?: number;

  @ApiProperty({
    description: 'Stock actual del producto',
    example: 50,
    minimum: 0,
  })
  @IsNumber({}, { message: 'El stock debe ser un número' })
  @Min(0, { message: 'El stock no puede ser negativo' })
  @Type(() => Number)
  stock: number;

  @ApiProperty({
    description: 'Stock mínimo antes de alerta',
    example: 10,
    minimum: 0,
  })
  @IsNumber({}, { message: 'El stock mínimo debe ser un número' })
  @Min(0, { message: 'El stock mínimo no puede ser negativo' })
  @Type(() => Number)
  stockMinimo: number;

  @ApiPropertyOptional({
    description: 'Categoría del producto',
    example: 'Vinos',
  })
  @IsOptional()
  @IsString({ message: 'La categoría debe ser una cadena de texto' })
  categoria?: string;

  @ApiPropertyOptional({
    description: 'Marca del producto',
    example: 'Bodega Premium',
  })
  @IsOptional()
  @IsString({ message: 'La marca debe ser una cadena de texto' })
  marca?: string;

  @ApiPropertyOptional({
    description: 'Unidad de medida',
    example: 'ml',
  })
  @IsOptional()
  @IsString({ message: 'La unidad de medida debe ser una cadena de texto' })
  unidadMedida?: string;

  @ApiPropertyOptional({
    description: 'Contenido del producto',
    example: 750,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El contenido debe ser un número' })
  @IsPositive({ message: 'El contenido debe ser mayor a 0' })
  @Type(() => Number)
  contenido?: number;

  @ApiPropertyOptional({
    description: 'Grado alcohólico del producto',
    example: 13.5,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El grado alcohólico debe ser un número' })
  @Min(0, { message: 'El grado alcohólico no puede ser negativo' })
  @Max(100, { message: 'El grado alcohólico no puede ser mayor a 100' })
  @Type(() => Number)
  gradoAlcoholico?: number;

  @ApiPropertyOptional({
    description: 'País de origen',
    example: 'Chile',
  })
  @IsOptional()
  @IsString({ message: 'El país de origen debe ser una cadena de texto' })
  paisOrigen?: string;

  @ApiPropertyOptional({
    description: 'Proveedor del producto',
    example: 'Distribuidora ABC',
  })
  @IsOptional()
  @IsString({ message: 'El proveedor debe ser una cadena de texto' })
  proveedor?: string;

  @ApiPropertyOptional({
    description: 'Código de barras',
    example: '7891234567890',
  })
  @IsOptional()
  @IsString({ message: 'El código de barras debe ser una cadena de texto' })
  codigoBarras?: string;

  @ApiPropertyOptional({
    description: 'URL de la imagen principal',
    example: 'https://example.com/imagen.jpg',
  })
  @IsOptional()
  @IsString({ message: 'La imagen debe ser una cadena de texto' })
  imagen?: string;

  @ApiPropertyOptional({
    description: 'Array de URLs de imágenes adicionales',
    type: [String],
    example: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
  })
  @IsOptional()
  @IsArray({ message: 'Las imágenes deben ser un array' })
  @IsString({ each: true, message: 'Cada imagen debe ser una cadena de texto' })
  imagenes?: string[];

  @ApiPropertyOptional({
    description: 'Indica si el producto es bonificado (no genera puntos)',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'esBonificado debe ser un valor booleano' })
  esBonificado?: boolean;

  @ApiPropertyOptional({
    description: 'Indica si el producto habilita puntos',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'habilitaPuntos debe ser un valor booleano' })
  habilitaPuntos?: boolean;

  @ApiPropertyOptional({
    description: 'Indica si el producto es destacado',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'esDestacado debe ser un valor booleano' })
  esDestacado?: boolean;

  @ApiPropertyOptional({
    description: 'Indica si el producto es visible en el catálogo',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'esVisible debe ser un valor booleano' })
  esVisible?: boolean;

  @ApiPropertyOptional({
    description: 'Indica si requiere verificación de edad mínima',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'requiereEdadMinima debe ser un valor booleano' })
  requiereEdadMinima?: boolean;

  @ApiPropertyOptional({
    description: 'Edad mínima requerida',
    example: 18,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber({}, { message: 'La edad mínima debe ser un número' })
  @Min(0, { message: 'La edad mínima no puede ser negativa' })
  @Max(100, { message: 'La edad mínima no puede ser mayor a 100' })
  @Type(() => Number)
  edadMinima?: number;

  @ApiPropertyOptional({
    description: 'Características del producto',
    type: 'object',
    properties: {
      color: { type: 'string', example: 'Rojo rubí' },
      aroma: { type: 'string', example: 'Frutal con notas a madera' },
      sabor: { type: 'string', example: 'Equilibrado con taninos suaves' },
      maridaje: { type: 'array', items: { type: 'string' }, example: ['Carnes rojas', 'Quesos'] },
      temperatura: { type: 'string', example: '16-18°C' },
      ocasion: { type: 'array', items: { type: 'string' }, example: ['Cena', 'Celebración'] },
    },
  })
  @IsOptional()
  @IsObject({ message: 'Las características deben ser un objeto válido' })
  caracteristicas?: {
    color?: string;
    aroma?: string;
    sabor?: string;
    maridaje?: string[];
    temperatura?: string;
    ocasion?: string[];
  };
}

