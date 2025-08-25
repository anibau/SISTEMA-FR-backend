import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsDateString,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CategoriaGasto, TipoComprobante } from '../entities/gasto.entity';

export class ArchivoAdjuntoDto {
  @ApiProperty({
    description: 'Nombre del archivo',
    example: 'comprobante.pdf',
  })
  @IsString({ message: 'El nombre del archivo debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre del archivo es requerido' })
  nombre: string;

  @ApiProperty({
    description: 'URL del archivo',
    example: 'https://storage.example.com/comprobante.pdf',
  })
  @IsString({ message: 'La URL del archivo debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La URL del archivo es requerida' })
  url: string;

  @ApiProperty({
    description: 'Tipo MIME del archivo',
    example: 'application/pdf',
  })
  @IsString({ message: 'El tipo del archivo debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El tipo del archivo es requerido' })
  tipo: string;

  @ApiProperty({
    description: 'Tamaño del archivo en bytes',
    example: 1024000,
    minimum: 0,
  })
  @IsNumber({}, { message: 'El tamaño debe ser un número' })
  @Min(0, { message: 'El tamaño no puede ser negativo' })
  @Type(() => Number)
  tamaño: number;
}

export class CreateGastoDto {
  @ApiProperty({
    description: 'Descripción del gasto',
    example: 'Pago de servicio de luz - Enero 2024',
  })
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La descripción es requerida' })
  descripcion: string;

  @ApiProperty({
    description: 'Categoría del gasto',
    enum: CategoriaGasto,
    example: CategoriaGasto.SERVICIOS,
  })
  @IsEnum(CategoriaGasto, { message: 'Categoría de gasto inválida' })
  categoria: CategoriaGasto;

  @ApiProperty({
    description: 'Monto del gasto',
    example: 150.75,
    minimum: 0,
  })
  @IsNumber({}, { message: 'El monto debe ser un número' })
  @Min(0, { message: 'El monto no puede ser negativo' })
  @Type(() => Number)
  monto: number;

  @ApiProperty({
    description: 'Fecha del gasto',
    example: '2024-01-15',
  })
  @IsDateString({}, { message: 'La fecha del gasto debe ser una fecha válida' })
  fechaGasto: Date;

  @ApiProperty({
    description: 'ID del usuario que registra el gasto',
    example: 'uuid-usuario-1',
  })
  @IsString({ message: 'El ID del usuario debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El ID del usuario es requerido' })
  usuarioId: string;

  @ApiProperty({
    description: 'Nombre del usuario que registra el gasto',
    example: 'Juan Pérez',
  })
  @IsString({ message: 'El nombre del usuario debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre del usuario es requerido' })
  usuarioNombre: string;

  @ApiPropertyOptional({
    description: 'Tipo de comprobante',
    enum: TipoComprobante,
    example: TipoComprobante.FACTURA,
  })
  @IsOptional()
  @IsEnum(TipoComprobante, { message: 'Tipo de comprobante inválido' })
  tipoComprobante?: TipoComprobante;

  @ApiPropertyOptional({
    description: 'Número del comprobante',
    example: 'F001-00001234',
  })
  @IsOptional()
  @IsString({ message: 'El número de comprobante debe ser una cadena de texto' })
  numeroComprobante?: string;

  @ApiPropertyOptional({
    description: 'RUC del proveedor',
    example: '20123456789',
  })
  @IsOptional()
  @IsString({ message: 'El RUC debe ser una cadena de texto' })
  rucProveedor?: string;

  @ApiPropertyOptional({
    description: 'Nombre del proveedor',
    example: 'Empresa de Servicios S.A.C.',
  })
  @IsOptional()
  @IsString({ message: 'El nombre del proveedor debe ser una cadena de texto' })
  nombreProveedor?: string;

  @ApiPropertyOptional({
    description: 'Fecha del comprobante',
    example: '2024-01-15',
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha del comprobante debe ser una fecha válida' })
  fechaComprobante?: Date;

  @ApiPropertyOptional({
    description: 'Observaciones adicionales',
    example: 'Pago correspondiente al mes de enero',
  })
  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser una cadena de texto' })
  observaciones?: string;

  @ApiPropertyOptional({
    description: 'Es un gasto recurrente',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'esRecurrente debe ser un valor booleano' })
  esRecurrente?: boolean;

  @ApiPropertyOptional({
    description: 'Día del mes para gastos recurrentes (1-31)',
    example: 15,
    minimum: 1,
    maximum: 31,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El día de recurrencia debe ser un número' })
  @Min(1, { message: 'El día debe estar entre 1 y 31' })
  @Type(() => Number)
  diaRecurrencia?: number;

  @ApiPropertyOptional({
    description: 'Archivos adjuntos',
    type: [ArchivoAdjuntoDto],
  })
  @IsOptional()
  @IsArray({ message: 'Los archivos adjuntos deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => ArchivoAdjuntoDto)
  archivosAdjuntos?: ArchivoAdjuntoDto[];

  @ApiPropertyOptional({
    description: 'Cuenta contable',
    example: '6311001',
  })
  @IsOptional()
  @IsString({ message: 'La cuenta contable debe ser una cadena de texto' })
  cuentaContable?: string;

  @ApiPropertyOptional({
    description: 'Centro de costo',
    example: 'TIENDA-01',
  })
  @IsOptional()
  @IsString({ message: 'El centro de costo debe ser una cadena de texto' })
  centroCosto?: string;
}

export class AprobarGastoDto {
  @ApiPropertyOptional({
    description: 'Observaciones de la aprobación',
    example: 'Aprobado - Gasto justificado',
  })
  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser una cadena de texto' })
  observaciones?: string;
}

export class RechazarGastoDto {
  @ApiProperty({
    description: 'Motivo del rechazo',
    example: 'Falta comprobante válido',
  })
  @IsString({ message: 'El motivo del rechazo debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El motivo del rechazo es requerido' })
  motivo: string;

  @ApiPropertyOptional({
    description: 'Observaciones adicionales',
    example: 'Solicitar factura original',
  })
  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser una cadena de texto' })
  observaciones?: string;
}

export class PagarGastoDto {
  @ApiProperty({
    description: 'Método de pago utilizado',
    example: 'transferencia',
  })
  @IsString({ message: 'El método de pago debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El método de pago es requerido' })
  metodoPago: string;

  @ApiPropertyOptional({
    description: 'Número de operación o referencia',
    example: 'TRF-20240115-001',
  })
  @IsOptional()
  @IsString({ message: 'El número de operación debe ser una cadena de texto' })
  numeroOperacion?: string;

  @ApiPropertyOptional({
    description: 'ID del cierre de caja (si se paga desde caja)',
    example: 'uuid-cierre-1',
  })
  @IsOptional()
  @IsString({ message: 'El ID del cierre de caja debe ser una cadena de texto' })
  cierreCajaId?: string;

  @ApiPropertyOptional({
    description: 'Observaciones del pago',
    example: 'Pago realizado por transferencia bancaria',
  })
  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser una cadena de texto' })
  observaciones?: string;
}

