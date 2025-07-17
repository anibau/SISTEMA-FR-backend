import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  IsDateString,
  Min,
  Max,
  ValidateIf,
  IsTimeString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TipoPromocion, EstadoPromocion, DiaSemana } from '../entities/promocion.entity';

export class CreatePromocionDto {
  @ApiProperty({
    description: 'Código único de la promoción',
    example: 'PROMO001',
  })
  @IsString({ message: 'El código debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El código es requerido' })
  codigo: string;

  @ApiProperty({
    description: 'Nombre de la promoción',
    example: 'Descuento de Cumpleaños',
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre: string;

  @ApiPropertyOptional({
    description: 'Descripción de la promoción',
    example: '10% de descuento en el día de tu cumpleaños',
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  descripcion?: string;

  @ApiProperty({
    description: 'Tipo de promoción',
    enum: TipoPromocion,
    example: TipoPromocion.DESCUENTO_PORCENTAJE,
  })
  @IsEnum(TipoPromocion, { message: 'Tipo de promoción inválido' })
  tipo: TipoPromocion;

  @ApiPropertyOptional({
    description: 'Estado de la promoción',
    enum: EstadoPromocion,
    example: EstadoPromocion.ACTIVA,
  })
  @IsOptional()
  @IsEnum(EstadoPromocion, { message: 'Estado de promoción inválido' })
  estado?: EstadoPromocion;

  @ApiPropertyOptional({
    description: 'Porcentaje de descuento (para tipo descuento_porcentaje)',
    example: 15,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @ValidateIf(o => o.tipo === TipoPromocion.DESCUENTO_PORCENTAJE || o.tipo === TipoPromocion.CUMPLEANOS)
  @IsNumber({}, { message: 'El porcentaje de descuento debe ser un número' })
  @Min(0, { message: 'El porcentaje no puede ser negativo' })
  @Max(100, { message: 'El porcentaje no puede ser mayor a 100' })
  @Type(() => Number)
  descuentoPorcentaje?: number;

  @ApiPropertyOptional({
    description: 'Monto de descuento (para tipo descuento_monto)',
    example: 10.50,
    minimum: 0,
  })
  @IsOptional()
  @ValidateIf(o => o.tipo === TipoPromocion.DESCUENTO_MONTO)
  @IsNumber({}, { message: 'El monto de descuento debe ser un número' })
  @Min(0, { message: 'El monto no puede ser negativo' })
  @Type(() => Number)
  descuentoMonto?: number;

  @ApiPropertyOptional({
    description: 'Monto mínimo de compra para aplicar la promoción',
    example: 50.00,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El monto mínimo debe ser un número' })
  @Min(0, { message: 'El monto mínimo no puede ser negativo' })
  @Type(() => Number)
  montoMinimo?: number;

  @ApiPropertyOptional({
    description: 'Cantidad mínima de productos para aplicar la promoción',
    example: 2,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: 'La cantidad mínima debe ser un número' })
  @Min(1, { message: 'La cantidad mínima debe ser mayor a 0' })
  @Type(() => Number)
  cantidadMinima?: number;

  @ApiProperty({
    description: 'Fecha de inicio de la promoción',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsDateString({}, { message: 'La fecha de inicio debe ser una fecha válida' })
  fechaInicio: Date;

  @ApiProperty({
    description: 'Fecha de fin de la promoción',
    example: '2024-12-31T23:59:59.000Z',
  })
  @IsDateString({}, { message: 'La fecha de fin debe ser una fecha válida' })
  fechaFin: Date;

  @ApiPropertyOptional({
    description: 'Hora de inicio (formato HH:mm)',
    example: '09:00',
  })
  @IsOptional()
  @IsTimeString({}, { message: 'La hora de inicio debe tener formato HH:mm' })
  horaInicio?: string;

  @ApiPropertyOptional({
    description: 'Hora de fin (formato HH:mm)',
    example: '18:00',
  })
  @IsOptional()
  @IsTimeString({}, { message: 'La hora de fin debe tener formato HH:mm' })
  horaFin?: string;

  @ApiPropertyOptional({
    description: 'Días de la semana en que aplica la promoción',
    enum: DiaSemana,
    isArray: true,
    example: [DiaSemana.LUNES, DiaSemana.MARTES],
  })
  @IsOptional()
  @IsArray({ message: 'Los días de semana deben ser un array' })
  @IsEnum(DiaSemana, { each: true, message: 'Día de semana inválido' })
  diasSemana?: DiaSemana[];

  @ApiPropertyOptional({
    description: 'Uso máximo total de la promoción',
    example: 100,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El uso máximo debe ser un número' })
  @Min(1, { message: 'El uso máximo debe ser mayor a 0' })
  @Type(() => Number)
  usoMaximo?: number;

  @ApiPropertyOptional({
    description: 'Uso máximo por cliente',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El uso máximo por cliente debe ser un número' })
  @Min(1, { message: 'El uso máximo por cliente debe ser mayor a 0' })
  @Type(() => Number)
  usoMaximoPorCliente?: number;

  @ApiPropertyOptional({
    description: 'IDs de categorías aplicables',
    type: [String],
    example: ['categoria-1', 'categoria-2'],
  })
  @IsOptional()
  @IsArray({ message: 'Las categorías aplicables deben ser un array' })
  @IsString({ each: true, message: 'Cada categoría debe ser una cadena de texto' })
  categoriasAplicables?: string[];

  @ApiPropertyOptional({
    description: 'IDs de productos específicos aplicables',
    type: [String],
    example: ['producto-1', 'producto-2'],
  })
  @IsOptional()
  @IsArray({ message: 'Los productos aplicables deben ser un array' })
  @IsString({ each: true, message: 'Cada producto debe ser una cadena de texto' })
  productosAplicables?: string[];

  @ApiPropertyOptional({
    description: 'IDs de productos excluidos',
    type: [String],
    example: ['producto-3', 'producto-4'],
  })
  @IsOptional()
  @IsArray({ message: 'Los productos excluidos deben ser un array' })
  @IsString({ each: true, message: 'Cada producto debe ser una cadena de texto' })
  productosExcluidos?: string[];

  @ApiPropertyOptional({
    description: 'Marcas aplicables',
    type: [String],
    example: ['Marca A', 'Marca B'],
  })
  @IsOptional()
  @IsArray({ message: 'Las marcas aplicables deben ser un array' })
  @IsString({ each: true, message: 'Cada marca debe ser una cadena de texto' })
  marcasAplicables?: string[];

  @ApiPropertyOptional({
    description: 'Aplica en delivery',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'aplicaEnDelivery debe ser un valor booleano' })
  aplicaEnDelivery?: boolean;

  @ApiPropertyOptional({
    description: 'Aplica en mostrador',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'aplicaEnMostrador debe ser un valor booleano' })
  aplicaEnMostrador?: boolean;

  @ApiPropertyOptional({
    description: 'Requiere código promocional',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'requiereCodigoPromocional debe ser un valor booleano' })
  requiereCodigoPromocional?: boolean;

  @ApiPropertyOptional({
    description: 'Código promocional (si se requiere)',
    example: 'CUMPLE2024',
  })
  @IsOptional()
  @ValidateIf(o => o.requiereCodigoPromocional === true)
  @IsString({ message: 'El código promocional debe ser una cadena de texto' })
  codigoPromocional?: string;

  @ApiPropertyOptional({
    description: 'Es cumulable con otras promociones',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'esCumulable debe ser un valor booleano' })
  esCumulable?: boolean;

  @ApiPropertyOptional({
    description: 'Observaciones adicionales',
    example: 'Promoción especial para clientes VIP',
  })
  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser una cadena de texto' })
  observaciones?: string;
}

