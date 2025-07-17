import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TipoNotificacion, PrioridadNotificacion } from '../entities/notificacion.entity';

export class CreateNotificacionDto {
  @ApiProperty({
    description: 'Tipo de notificación',
    enum: TipoNotificacion,
    example: TipoNotificacion.STOCK_BAJO,
  })
  @IsEnum(TipoNotificacion, { message: 'Tipo de notificación inválido' })
  tipo: TipoNotificacion;

  @ApiProperty({
    description: 'Título de la notificación',
    example: 'Stock Bajo',
  })
  @IsString({ message: 'El título debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El título es requerido' })
  titulo: string;

  @ApiProperty({
    description: 'Mensaje de la notificación',
    example: 'El producto "Cerveza Corona" tiene stock bajo (5 unidades)',
  })
  @IsString({ message: 'El mensaje debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El mensaje es requerido' })
  mensaje: string;

  @ApiPropertyOptional({
    description: 'Prioridad de la notificación',
    enum: PrioridadNotificacion,
    example: PrioridadNotificacion.MEDIA,
  })
  @IsOptional()
  @IsEnum(PrioridadNotificacion, { message: 'Prioridad inválida' })
  prioridad?: PrioridadNotificacion;

  @ApiPropertyOptional({
    description: 'ID del usuario destinatario (null para todos)',
    example: 'uuid-usuario-1',
  })
  @IsOptional()
  @IsString({ message: 'El ID del usuario debe ser una cadena de texto' })
  usuarioId?: string;

  @ApiPropertyOptional({
    description: 'Nombre del usuario destinatario',
    example: 'Juan Pérez',
  })
  @IsOptional()
  @IsString({ message: 'El nombre del usuario debe ser una cadena de texto' })
  usuarioNombre?: string;

  @ApiPropertyOptional({
    description: 'Rol destinatario (para notificaciones por rol)',
    example: 'administrador',
  })
  @IsOptional()
  @IsString({ message: 'El rol debe ser una cadena de texto' })
  rolDestino?: string;

  @ApiPropertyOptional({
    description: 'ID del objeto relacionado',
    example: 'uuid-producto-1',
  })
  @IsOptional()
  @IsString({ message: 'El ID de referencia debe ser una cadena de texto' })
  referenciaId?: string;

  @ApiPropertyOptional({
    description: 'Tabla del objeto relacionado',
    example: 'productos',
  })
  @IsOptional()
  @IsString({ message: 'La tabla de referencia debe ser una cadena de texto' })
  referenciaTabla?: string;

  @ApiPropertyOptional({
    description: 'Metadatos adicionales',
    example: {
      productoId: 'uuid-producto-1',
      productoNombre: 'Cerveza Corona',
      stockActual: 5,
      stockMinimo: 10,
    },
  })
  @IsOptional()
  @IsObject({ message: 'Los metadatos deben ser un objeto' })
  metadatos?: any;

  @ApiPropertyOptional({
    description: 'Fecha de expiración',
    example: '2024-01-16T23:59:59.000Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de expiración debe ser una fecha válida' })
  fechaExpiracion?: Date;

  @ApiPropertyOptional({
    description: 'Mostrar en dashboard',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'mostrarEnDashboard debe ser un valor booleano' })
  mostrarEnDashboard?: boolean;

  @ApiPropertyOptional({
    description: 'Requiere acción del usuario',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'requiereAccion debe ser un valor booleano' })
  requiereAccion?: boolean;

  @ApiPropertyOptional({
    description: 'URL para realizar la acción',
    example: '/productos/uuid-producto-1',
  })
  @IsOptional()
  @IsString({ message: 'La URL de acción debe ser una cadena de texto' })
  urlAccion?: string;

  @ApiPropertyOptional({
    description: 'Texto del botón de acción',
    example: 'Ver Producto',
  })
  @IsOptional()
  @IsString({ message: 'El texto de acción debe ser una cadena de texto' })
  textoAccion?: string;

  @ApiPropertyOptional({
    description: 'ID del usuario que crea la notificación',
    example: 'uuid-usuario-admin',
  })
  @IsOptional()
  @IsString({ message: 'El ID del creador debe ser una cadena de texto' })
  creadaPor?: string;

  @ApiPropertyOptional({
    description: 'Origen de la notificación',
    example: 'sistema',
  })
  @IsOptional()
  @IsString({ message: 'El origen debe ser una cadena de texto' })
  origen?: string;
}

export class MarcarLeidaDto {
  @ApiPropertyOptional({
    description: 'Marcar múltiples notificaciones como leídas',
    example: ['uuid-notif-1', 'uuid-notif-2'],
  })
  @IsOptional()
  @IsString({ each: true, message: 'Cada ID debe ser una cadena de texto' })
  notificacionIds?: string[];
}

export class ArchivarNotificacionDto {
  @ApiPropertyOptional({
    description: 'Archivar múltiples notificaciones',
    example: ['uuid-notif-1', 'uuid-notif-2'],
  })
  @IsOptional()
  @IsString({ each: true, message: 'Cada ID debe ser una cadena de texto' })
  notificacionIds?: string[];
}

