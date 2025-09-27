import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateVentaDto } from './create-venta.dto';
import { EstadoVenta } from '../entities/venta.entity';

export class UpdateVentaDto extends PartialType(CreateVentaDto) {
  @ApiPropertyOptional({
    description: 'Estado de la venta',
    enum: EstadoVenta,
    example: EstadoVenta.COMPLETADA,
  })
  @IsOptional()
  @IsEnum(EstadoVenta)
  estado?: EstadoVenta;

  @ApiPropertyOptional({
    description: 'Observaciones adicionales',
    example: 'Venta procesada correctamente',
  })
  @IsOptional()
  @IsString()
  observaciones?: string;

  @ApiPropertyOptional({
    description: 'Motivo de cancelación o anulación',
    example: 'Cliente canceló el pedido',
  })
  @IsOptional()
  @IsString()
  motivo?: string;
}

