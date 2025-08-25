import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsDateString,
  IsPhoneNumber,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TipoPedido, MetodoContacto } from '../entities/delivery.entity';

export class CreateDeliveryDto {
  @ApiProperty({
    description: 'ID de la venta asociada',
    example: 'uuid-venta-1',
  })
  @IsString({ message: 'El ID de la venta debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El ID de la venta es requerido' })
  ventaId: string;

  @ApiPropertyOptional({
    description: 'ID del cliente (opcional)',
    example: 'uuid-cliente-1',
  })
  @IsOptional()
  @IsString({ message: 'El ID del cliente debe ser una cadena de texto' })
  clienteId?: string;

  @ApiPropertyOptional({
    description: 'Tipo de pedido',
    enum: TipoPedido,
    example: TipoPedido.WHATSAPP,
  })
  @IsOptional()
  @IsEnum(TipoPedido, { message: 'Tipo de pedido inválido' })
  tipoPedido?: TipoPedido;

  @ApiProperty({
    description: 'Nombre del cliente',
    example: 'Juan Pérez',
  })
  @IsString({ message: 'El nombre del cliente debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre del cliente es requerido' })
  clienteNombre: string;

  @ApiProperty({
    description: 'Teléfono del cliente',
    example: '987654321',
  })
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El teléfono es requerido' })
  clienteTelefono: string;

  @ApiPropertyOptional({
    description: 'Documento del cliente',
    example: '12345678',
  })
  @IsOptional()
  @IsString({ message: 'El documento debe ser una cadena de texto' })
  clienteDocumento?: string;

  @ApiProperty({
    description: 'Dirección de entrega',
    example: 'Av. Principal 123, San Isidro',
  })
  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La dirección de entrega es requerida' })
  direccionEntrega: string;

  @ApiPropertyOptional({
    description: 'Referencia de la dirección',
    example: 'Frente al parque, casa azul',
  })
  @IsOptional()
  @IsString({ message: 'La referencia debe ser una cadena de texto' })
  referenciaDireccion?: string;

  @ApiPropertyOptional({
    description: 'Distrito',
    example: 'San Isidro',
  })
  @IsOptional()
  @IsString({ message: 'El distrito debe ser una cadena de texto' })
  distrito?: string;

  @ApiPropertyOptional({
    description: 'Provincia',
    example: 'Lima',
  })
  @IsOptional()
  @IsString({ message: 'La provincia debe ser una cadena de texto' })
  provincia?: string;

  @ApiPropertyOptional({
    description: 'Departamento',
    example: 'Lima',
  })
  @IsOptional()
  @IsString({ message: 'El departamento debe ser una cadena de texto' })
  departamento?: string;

  @ApiPropertyOptional({
    description: 'Latitud de la dirección',
    example: -12.0464,
    minimum: -90,
    maximum: 90,
  })
  @IsOptional()
  @IsNumber({}, { message: 'La latitud debe ser un número' })
  @Min(-90, { message: 'La latitud debe estar entre -90 y 90' })
  @Max(90, { message: 'La latitud debe estar entre -90 y 90' })
  @Type(() => Number)
  latitud?: number;

  @ApiPropertyOptional({
    description: 'Longitud de la dirección',
    example: -77.0428,
    minimum: -180,
    maximum: 180,
  })
  @IsOptional()
  @IsNumber({}, { message: 'La longitud debe ser un número' })
  @Min(-180, { message: 'La longitud debe estar entre -180 y 180' })
  @Max(180, { message: 'La longitud debe estar entre -180 y 180' })
  @Type(() => Number)
  longitud?: number;

  @ApiProperty({
    description: 'Monto total del pedido',
    example: 85.50,
    minimum: 0,
  })
  @IsNumber({}, { message: 'El monto total debe ser un número' })
  @Min(0, { message: 'El monto total no puede ser negativo' })
  @Type(() => Number)
  montoTotal: number;

  @ApiProperty({
    description: 'Costo del delivery',
    example: 5.00,
    minimum: 0,
  })
  @IsNumber({}, { message: 'El costo del delivery debe ser un número' })
  @Min(0, { message: 'El costo del delivery no puede ser negativo' })
  @Type(() => Number)
  costoDelivery: number;

  @ApiPropertyOptional({
    description: 'Distancia en kilómetros',
    example: 3.5,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'La distancia debe ser un número' })
  @Min(0, { message: 'La distancia no puede ser negativa' })
  @Type(() => Number)
  distanciaKm?: number;

  @ApiPropertyOptional({
    description: 'Fecha estimada de entrega',
    example: '2024-01-15T14:30:00.000Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha estimada debe ser una fecha válida' })
  fechaEntregaEstimada?: Date;

  @ApiPropertyOptional({
    description: 'Método de contacto preferido',
    enum: MetodoContacto,
    example: MetodoContacto.WHATSAPP,
  })
  @IsOptional()
  @IsEnum(MetodoContacto, { message: 'Método de contacto inválido' })
  metodoContactoPreferido?: MetodoContacto;

  @ApiPropertyOptional({
    description: 'Observaciones del pedido',
    example: 'Entregar después de las 6 PM',
  })
  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser una cadena de texto' })
  observaciones?: string;

  @ApiPropertyOptional({
    description: 'Prioridad del pedido (1=alta, 2=media, 3=baja)',
    example: 1,
    minimum: 1,
    maximum: 3,
  })
  @IsOptional()
  @IsNumber({}, { message: 'La prioridad debe ser un número' })
  @Min(1, { message: 'La prioridad debe ser 1, 2 o 3' })
  @Max(3, { message: 'La prioridad debe ser 1, 2 o 3' })
  @Type(() => Number)
  prioridad?: number;

  @ApiPropertyOptional({
    description: 'Requiere confirmación telefónica',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'requiereConfirmacion debe ser un valor booleano' })
  requiereConfirmacion?: boolean;

  @ApiPropertyOptional({
    description: 'Es pago contraentrega',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'esPagoContraentrega debe ser un valor booleano' })
  esPagoContraentrega?: boolean;

  @ApiPropertyOptional({
    description: 'Monto ya pagado',
    example: 50.00,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El monto pagado debe ser un número' })
  @Min(0, { message: 'El monto pagado no puede ser negativo' })
  @Type(() => Number)
  montoPagado?: number;

  @ApiPropertyOptional({
    description: 'Cambio requerido',
    example: 14.50,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El cambio requerido debe ser un número' })
  @Min(0, { message: 'El cambio requerido no puede ser negativo' })
  @Type(() => Number)
  cambioRequerido?: number;
}

export class UpdateEstadoDeliveryDto {
  @ApiPropertyOptional({
    description: 'ID del repartidor asignado',
    example: 'uuid-repartidor-1',
  })
  @IsOptional()
  @IsString({ message: 'El ID del repartidor debe ser una cadena de texto' })
  repartidorId?: string;

  @ApiPropertyOptional({
    description: 'Nombre del repartidor',
    example: 'Carlos Ramos',
  })
  @IsOptional()
  @IsString({ message: 'El nombre del repartidor debe ser una cadena de texto' })
  repartidorNombre?: string;

  @ApiPropertyOptional({
    description: 'Teléfono del repartidor',
    example: '987123456',
  })
  @IsOptional()
  @IsString({ message: 'El teléfono del repartidor debe ser una cadena de texto' })
  repartidorTelefono?: string;

  @ApiPropertyOptional({
    description: 'Observaciones adicionales',
    example: 'Cliente no estaba, se reprogramó entrega',
  })
  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser una cadena de texto' })
  observaciones?: string;
}

export class CancelarDeliveryDto {
  @ApiProperty({
    description: 'Motivo de la cancelación',
    example: 'Cliente canceló el pedido',
  })
  @IsString({ message: 'El motivo debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El motivo de cancelación es requerido' })
  motivo: string;
}

export class CalificarDeliveryDto {
  @ApiProperty({
    description: 'Calificación del 1 al 5',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsNumber({}, { message: 'La calificación debe ser un número' })
  @Min(1, { message: 'La calificación debe ser entre 1 y 5' })
  @Max(5, { message: 'La calificación debe ser entre 1 y 5' })
  @Type(() => Number)
  calificacion: number;

  @ApiPropertyOptional({
    description: 'Comentario del cliente',
    example: 'Excelente servicio, muy rápido',
  })
  @IsOptional()
  @IsString({ message: 'El comentario debe ser una cadena de texto' })
  comentario?: string;
}

export class AgregarContactoDto {
  @ApiProperty({
    description: 'Método de contacto utilizado',
    enum: MetodoContacto,
    example: MetodoContacto.WHATSAPP,
  })
  @IsEnum(MetodoContacto, { message: 'Método de contacto inválido' })
  metodo: MetodoContacto;

  @ApiProperty({
    description: 'Mensaje enviado',
    example: 'Su pedido está en camino',
  })
  @IsString({ message: 'El mensaje debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El mensaje es requerido' })
  mensaje: string;

  @ApiProperty({
    description: 'Si el contacto fue exitoso',
    example: true,
  })
  @IsBoolean({ message: 'exitoso debe ser un valor booleano' })
  exitoso: boolean;
}

