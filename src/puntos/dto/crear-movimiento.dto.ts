import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TipoMovimientoPunto } from '../entities/punto.entity';

export class CrearMovimientoPuntoDto {
  @ApiProperty({
    description: 'ID del cliente',
    example: 'uuid-cliente-1',
  })
  @IsString({ message: 'El ID del cliente debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El ID del cliente es requerido' })
  clienteId: string;

  @ApiProperty({
    description: 'Tipo de movimiento de puntos',
    enum: TipoMovimientoPunto,
    example: TipoMovimientoPunto.GANADO,
  })
  @IsEnum(TipoMovimientoPunto, { message: 'Tipo de movimiento inválido' })
  tipo: TipoMovimientoPunto;

  @ApiProperty({
    description: 'Cantidad de puntos (positivo para ganados, negativo para usados)',
    example: 50,
  })
  @IsNumber({}, { message: 'Los puntos deben ser un número' })
  @Type(() => Number)
  puntos: number;

  @ApiPropertyOptional({
    description: 'ID de la venta relacionada',
    example: 'uuid-venta-1',
  })
  @IsOptional()
  @IsString({ message: 'El ID de la venta debe ser una cadena de texto' })
  ventaId?: string;

  @ApiPropertyOptional({
    description: 'ID del canje relacionado',
    example: 'uuid-canje-1',
  })
  @IsOptional()
  @IsString({ message: 'El ID del canje debe ser una cadena de texto' })
  canjeId?: string;

  @ApiPropertyOptional({
    description: 'Monto de compra que generó los puntos',
    example: 100.50,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El monto de compra debe ser un número' })
  @Min(0, { message: 'El monto de compra no puede ser negativo' })
  @Type(() => Number)
  montoCompra?: number;

  @ApiPropertyOptional({
    description: 'Valor en soles del canje',
    example: 5.00,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El valor del canje debe ser un número' })
  @Min(0, { message: 'El valor del canje no puede ser negativo' })
  @Type(() => Number)
  valorCanje?: number;

  @ApiPropertyOptional({
    description: 'Descripción del movimiento',
    example: 'Puntos ganados por compra en mostrador',
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  descripcion?: string;
}

export class CanjearPuntosDto {
  @ApiProperty({
    description: 'ID del cliente',
    example: 'uuid-cliente-1',
  })
  @IsString({ message: 'El ID del cliente debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El ID del cliente es requerido' })
  clienteId: string;

  @ApiProperty({
    description: 'Cantidad de puntos a canjear',
    example: 100,
    minimum: 1,
  })
  @IsNumber({}, { message: 'Los puntos deben ser un número' })
  @IsPositive({ message: 'Los puntos deben ser mayor a 0' })
  @Type(() => Number)
  puntosUsados: number;

  @ApiPropertyOptional({
    description: 'ID de la venta donde se aplica el canje',
    example: 'uuid-venta-1',
  })
  @IsOptional()
  @IsString({ message: 'El ID de la venta debe ser una cadena de texto' })
  ventaId?: string;

  @ApiPropertyOptional({
    description: 'ID del producto específico canjeado',
    example: 'uuid-producto-1',
  })
  @IsOptional()
  @IsString({ message: 'El ID del producto debe ser una cadena de texto' })
  productoId?: string;

  @ApiPropertyOptional({
    description: 'Descripción del canje',
    example: 'Canje por descuento en compra',
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  descripcion?: string;
}

export class AjustarPuntosDto {
  @ApiProperty({
    description: 'ID del cliente',
    example: 'uuid-cliente-1',
  })
  @IsString({ message: 'El ID del cliente debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El ID del cliente es requerido' })
  clienteId: string;

  @ApiProperty({
    description: 'Cantidad de puntos a ajustar (positivo o negativo)',
    example: -25,
  })
  @IsNumber({}, { message: 'Los puntos deben ser un número' })
  @Type(() => Number)
  puntos: number;

  @ApiProperty({
    description: 'Motivo del ajuste',
    example: 'Corrección por error en sistema',
  })
  @IsString({ message: 'El motivo debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El motivo es requerido' })
  motivo: string;
}

export class ConsultarPuntosDto {
  @ApiPropertyOptional({
    description: 'Número de documento del cliente',
    example: '12345678',
  })
  @IsOptional()
  @IsString({ message: 'El número de documento debe ser una cadena de texto' })
  numeroDocumento?: string;

  @ApiPropertyOptional({
    description: 'Teléfono del cliente',
    example: '987654321',
  })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  telefono?: string;

  @ApiPropertyOptional({
    description: 'ID del cliente',
    example: 'uuid-cliente-1',
  })
  @IsOptional()
  @IsString({ message: 'El ID del cliente debe ser una cadena de texto' })
  clienteId?: string;
}

