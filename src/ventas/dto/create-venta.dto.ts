import { IsString, IsOptional, IsEnum, IsArray, ValidateNested, IsNumber, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MetodoPago, TipoVenta, EstadoVenta } from '../entities/venta.entity';

export class CreateVentaDetalleDto {
  @ApiProperty({
    description: 'ID del producto',
    example: 'uuid-producto',
  })
  @IsUUID()
  productoId: string;

  @ApiPropertyOptional({
    description: 'ID del combo (si aplica)',
    example: 'uuid-combo',
  })
  @IsOptional()
  @IsUUID()
  comboId?: string;

  @ApiProperty({
    description: 'Cantidad del producto',
    example: 2,
  })
  @IsNumber()
  cantidad: number;

  @ApiProperty({
    description: 'Precio unitario',
    example: 15.50,
  })
  @IsNumber()
  precioUnitario: number;

  @ApiPropertyOptional({
    description: 'Descuento aplicado',
    example: 2.50,
  })
  @IsOptional()
  @IsNumber()
  descuento?: number;

  @ApiPropertyOptional({
    description: 'ID de promoción aplicada',
    example: 'uuid-promocion',
  })
  @IsOptional()
  @IsUUID()
  promocionId?: string;
}

export class CreateVentaDeliveryDto {
  @ApiProperty({
    description: 'Dirección de entrega',
    example: 'Av. Principal 123, Lima',
  })
  @IsString()
  direccion: string;

  @ApiPropertyOptional({
    description: 'Costo del delivery',
    example: 5.00,
  })
  @IsOptional()
  @IsNumber()
  costoDelivery?: number;

  @ApiPropertyOptional({
    description: 'Latitud de la dirección',
    example: -12.0464,
  })
  @IsOptional()
  @IsNumber()
  latitud?: number;

  @ApiPropertyOptional({
    description: 'Longitud de la dirección',
    example: -77.0428,
  })
  @IsOptional()
  @IsNumber()
  longitud?: number;
}

export class CreateVentaDto {
  @ApiProperty({
    description: 'ID del usuario/vendedor',
    example: 'uuid-usuario',
  })
  @IsUUID()
  usuarioId: string;

  @ApiPropertyOptional({
    description: 'ID del cliente (si está registrado)',
    example: 'uuid-cliente',
  })
  @IsOptional()
  @IsUUID()
  clienteId?: string;

  @ApiProperty({
    description: 'Detalles de la venta',
    type: [CreateVentaDetalleDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVentaDetalleDto)
  detalles: CreateVentaDetalleDto[];

  @ApiProperty({
    description: 'Método de pago',
    enum: MetodoPago,
    example: MetodoPago.EFECTIVO,
  })
  @IsEnum(MetodoPago)
  metodoPago: MetodoPago;

  @ApiPropertyOptional({
    description: 'Tipo de venta',
    enum: TipoVenta,
    example: TipoVenta.MOSTRADOR,
  })
  @IsOptional()
  @IsEnum(TipoVenta)
  tipoVenta?: TipoVenta;

  @ApiPropertyOptional({
    description: 'Estado inicial de la venta',
    enum: EstadoVenta,
    example: EstadoVenta.PENDIENTE,
  })
  @IsOptional()
  @IsEnum(EstadoVenta)
  estado?: EstadoVenta;

  @ApiPropertyOptional({
    description: 'Descuento adicional aplicado',
    example: 5.00,
  })
  @IsOptional()
  @IsNumber()
  descuentoAdicional?: number;

  @ApiPropertyOptional({
    description: 'Información de delivery',
    type: CreateVentaDeliveryDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateVentaDeliveryDto)
  delivery?: CreateVentaDeliveryDto;

  @ApiPropertyOptional({
    description: 'Nombre del cliente (si no está registrado)',
    example: 'Juan Pérez',
  })
  @IsOptional()
  @IsString()
  clienteNombre?: string;

  @ApiPropertyOptional({
    description: 'Descripción del cliente (si no está registrado)',
    example: '12345678',
  })
  @IsOptional()
  @IsString()
  clienteDocumento?: string;

  @ApiPropertyOptional({
    description: 'Teléfono del cliente (si no está registrado)',
    example: '+51987654321',
  })
  @IsOptional()
  @IsString()
  clienteTelefono?: string;

  @ApiPropertyOptional({
    description: 'Observaciones adicionales',
    example: 'Cliente solicita bolsa adicional',
  })
  @IsOptional()
  @IsString()
  observaciones?: string;

  @ApiPropertyOptional({
    description: 'ID del ticket (para multiticket)',
    example: 'ticket-123',
  })
  @IsOptional()
  @IsString()
  ticketId?: string;
}

