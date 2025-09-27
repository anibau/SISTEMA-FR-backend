import { PartialType, OmitType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateProductoDto } from './create-producto.dto';
import { IsOptional, IsArray } from 'class-validator';

export class UpdateProductoDto extends PartialType(
  OmitType(CreateProductoDto, ['codigo'] as const)
) {
  @ApiPropertyOptional({
    description: 'Historial de cambios de precios',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        precio: { type: 'number' },
        fecha: { type: 'string', format: 'date-time' },
        usuario: { type: 'string' },
        motivo: { type: 'string' }
      }
    }
  })
  @IsOptional()
  @IsArray()
  historialPrecios?: Array<{
    precio: number;
    fecha: Date;
    usuario: string;
    motivo?: string;
  }>;
}
