import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TipoMovimientoCaja } from '../entities/cierre-caja.entity';

export class CreateCierreCajaDto {
  @ApiProperty({
    description: 'ID del usuario cajero',
    example: 'uuid-usuario-1',
  })
  @IsString({ message: 'El ID del usuario debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El ID del usuario es requerido' })
  usuarioId: string;

  @ApiProperty({
    description: 'Nombre del usuario cajero',
    example: 'Juan Pérez',
  })
  @IsString({ message: 'El nombre del usuario debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre del usuario es requerido' })
  usuarioNombre: string;

  @ApiPropertyOptional({
    description: 'Monto inicial en efectivo',
    example: 100.00,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El monto inicial en efectivo debe ser un número' })
  @Min(0, { message: 'El monto inicial no puede ser negativo' })
  @Type(() => Number)
  montoInicialEfectivo?: number;

  @ApiPropertyOptional({
    description: 'Monto inicial en Yape',
    example: 0.00,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El monto inicial en Yape debe ser un número' })
  @Min(0, { message: 'El monto inicial no puede ser negativo' })
  @Type(() => Number)
  montoInicialYape?: number;

  @ApiPropertyOptional({
    description: 'Monto inicial en Plin',
    example: 0.00,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El monto inicial en Plin debe ser un número' })
  @Min(0, { message: 'El monto inicial no puede ser negativo' })
  @Type(() => Number)
  montoInicialPlin?: number;

  @ApiPropertyOptional({
    description: 'Monto inicial en transferencias',
    example: 0.00,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El monto inicial en transferencias debe ser un número' })
  @Min(0, { message: 'El monto inicial no puede ser negativo' })
  @Type(() => Number)
  montoInicialTransferencia?: number;

  @ApiPropertyOptional({
    description: 'Observaciones de apertura',
    example: 'Turno de mañana - Todo normal',
  })
  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser una cadena de texto' })
  observaciones?: string;
}

export class CerrarCajaDto {
  @ApiProperty({
    description: 'Monto contado en efectivo',
    example: 245.50,
    minimum: 0,
  })
  @IsNumber({}, { message: 'El monto contado en efectivo debe ser un número' })
  @Min(0, { message: 'El monto contado no puede ser negativo' })
  @Type(() => Number)
  montoContadoEfectivo: number;

  @ApiPropertyOptional({
    description: 'Monto contado en Yape',
    example: 150.00,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El monto contado en Yape debe ser un número' })
  @Min(0, { message: 'El monto contado no puede ser negativo' })
  @Type(() => Number)
  montoContadoYape?: number;

  @ApiPropertyOptional({
    description: 'Monto contado en Plin',
    example: 75.25,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El monto contado en Plin debe ser un número' })
  @Min(0, { message: 'El monto contado no puede ser negativo' })
  @Type(() => Number)
  montoContadoPlin?: number;

  @ApiPropertyOptional({
    description: 'Monto contado en transferencias',
    example: 200.00,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El monto contado en transferencias debe ser un número' })
  @Min(0, { message: 'El monto contado no puede ser negativo' })
  @Type(() => Number)
  montoContadoTransferencia?: number;

  @ApiPropertyOptional({
    description: 'Observaciones del cierre',
    example: 'Cierre normal, sin novedades',
  })
  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser una cadena de texto' })
  observaciones?: string;

  @ApiPropertyOptional({
    description: 'Motivo de diferencia (si existe)',
    example: 'Faltante de S/ 2.50 por cambio mal dado',
  })
  @IsOptional()
  @IsString({ message: 'El motivo de diferencia debe ser una cadena de texto' })
  motivoDiferencia?: string;

  @ApiPropertyOptional({
    description: 'Número de clientes atendidos',
    example: 25,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El número de clientes debe ser un número' })
  @Min(0, { message: 'El número de clientes no puede ser negativo' })
  @Type(() => Number)
  clientesAtendidos?: number;
}

export class CreateMovimientoCajaDto {
  @ApiProperty({
    description: 'ID del cierre de caja',
    example: 'uuid-cierre-1',
  })
  @IsString({ message: 'El ID del cierre de caja debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El ID del cierre de caja es requerido' })
  cierreCajaId: string;

  @ApiProperty({
    description: 'Tipo de movimiento',
    enum: TipoMovimientoCaja,
    example: TipoMovimientoCaja.VENTA_EFECTIVO,
  })
  @IsEnum(TipoMovimientoCaja, { message: 'Tipo de movimiento inválido' })
  tipo: TipoMovimientoCaja;

  @ApiProperty({
    description: 'Monto del movimiento',
    example: 25.50,
    minimum: 0,
  })
  @IsNumber({}, { message: 'El monto debe ser un número' })
  @Min(0, { message: 'El monto no puede ser negativo' })
  @Type(() => Number)
  monto: number;

  @ApiPropertyOptional({
    description: 'Descripción del movimiento',
    example: 'Venta de cerveza Corona x2',
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  descripcion?: string;

  @ApiPropertyOptional({
    description: 'ID de referencia (venta, gasto, etc.)',
    example: 'uuid-venta-1',
  })
  @IsOptional()
  @IsString({ message: 'El ID de referencia debe ser una cadena de texto' })
  referenciaId?: string;

  @ApiPropertyOptional({
    description: 'Número de referencia (ticket, comprobante)',
    example: 'TKT-001',
  })
  @IsOptional()
  @IsString({ message: 'El número de referencia debe ser una cadena de texto' })
  numeroReferencia?: string;

  @ApiPropertyOptional({
    description: 'ID del usuario que realizó el movimiento',
    example: 'uuid-usuario-1',
  })
  @IsOptional()
  @IsString({ message: 'El ID del usuario debe ser una cadena de texto' })
  usuarioId?: string;
}

export class RevisarCierreDto {
  @ApiPropertyOptional({
    description: 'Observaciones de la revisión',
    example: 'Revisado - Todo conforme',
  })
  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser una cadena de texto' })
  observaciones?: string;
}

export class AprobarCierreDto {
  @ApiPropertyOptional({
    description: 'Observaciones de la aprobación',
    example: 'Aprobado - Sin observaciones',
  })
  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser una cadena de texto' })
  observaciones?: string;
}

