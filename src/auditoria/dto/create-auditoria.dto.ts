import { IsString, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoAccion, TipoEntidad } from '../entities/auditoria.entity';

export class CreateAuditoriaDto {
  @ApiProperty({
    description: 'Tipo de acción realizada',
    enum: TipoAccion,
    example: TipoAccion.CREAR,
  })
  @IsEnum(TipoAccion)
  accion: TipoAccion;

  @ApiProperty({
    description: 'Entidad afectada',
    enum: TipoEntidad,
    example: TipoEntidad.PRODUCTO,
  })
  @IsEnum(TipoEntidad)
  entidad: TipoEntidad;

  @ApiProperty({
    description: 'ID de la entidad afectada',
    example: 'uuid-entidad',
  })
  @IsUUID()
  entidadId: string;

  @ApiProperty({
    description: 'ID del usuario que realizó la acción',
    example: 'uuid-usuario',
  })
  @IsUUID()
  usuarioId: string;

  @ApiPropertyOptional({
    description: 'Valores anteriores (JSON)',
    example: { precio: 10.50, stock: 100 },
  })
  @IsOptional()
  valoresAnteriores?: { [key: string]: any };

  @ApiPropertyOptional({
    description: 'Valores nuevos (JSON)',
    example: { precio: 12.00, stock: 95 },
  })
  @IsOptional()
  valoresNuevos?: { [key: string]: any };

  @ApiPropertyOptional({
    description: 'Descripción adicional de la acción',
    example: 'Actualización de precio por inflación',
  })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional({
    description: 'Dirección IP del usuario',
    example: '192.168.1.100',
  })
  @IsOptional()
  @IsString()
  ip?: string;

  @ApiPropertyOptional({
    description: 'User Agent del navegador',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  })
  @IsOptional()
  @IsString()
  userAgent?: string;
}
