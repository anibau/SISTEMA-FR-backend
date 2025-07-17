import { IsOptional, IsString, IsBoolean, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class SearchProductoDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Buscar por nombre, código o descripción',
    example: 'vino tinto',
  })
  @IsOptional()
  @IsString({ message: 'El término de búsqueda debe ser una cadena de texto' })
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por categoría',
    example: 'Vinos',
  })
  @IsOptional()
  @IsString({ message: 'La categoría debe ser una cadena de texto' })
  categoria?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por marca',
    example: 'Bodega Premium',
  })
  @IsOptional()
  @IsString({ message: 'La marca debe ser una cadena de texto' })
  marca?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por proveedor',
    example: 'Distribuidora ABC',
  })
  @IsOptional()
  @IsString({ message: 'El proveedor debe ser una cadena de texto' })
  proveedor?: string;

  @ApiPropertyOptional({
    description: 'Filtrar solo productos destacados',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'esDestacado debe ser un valor booleano' })
  @Type(() => Boolean)
  esDestacado?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrar solo productos visibles',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'esVisible debe ser un valor booleano' })
  @Type(() => Boolean)
  esVisible?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrar solo productos con stock bajo',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'stockBajo debe ser un valor booleano' })
  @Type(() => Boolean)
  stockBajo?: boolean;

  @ApiPropertyOptional({
    description: 'Precio mínimo',
    example: 10.00,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El precio mínimo debe ser un número' })
  @Type(() => Number)
  precioMin?: number;

  @ApiPropertyOptional({
    description: 'Precio máximo',
    example: 100.00,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El precio máximo debe ser un número' })
  @Type(() => Number)
  precioMax?: number;

  @ApiPropertyOptional({
    description: 'Ordenar por campo',
    enum: ['nombre', 'precio', 'stock', 'categoria', 'createdAt', 'totalVendido'],
    example: 'nombre',
  })
  @IsOptional()
  @IsString({ message: 'El campo de ordenamiento debe ser una cadena de texto' })
  sortBy?: 'nombre' | 'precio' | 'stock' | 'categoria' | 'createdAt' | 'totalVendido';

  @ApiPropertyOptional({
    description: 'Dirección del ordenamiento',
    enum: ['ASC', 'DESC'],
    example: 'ASC',
  })
  @IsOptional()
  @IsString({ message: 'La dirección debe ser ASC o DESC' })
  sortOrder?: 'ASC' | 'DESC';
}

