import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateComboDto } from './create-combo.dto';
import { IsOptional, IsNumber, Min } from 'class-validator';

export class UpdateComboDto extends PartialType(CreateComboDto) {
  @ApiPropertyOptional({
    description: 'Total vendido del combo',
    example: 25,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalVendido?: number;

  @ApiPropertyOptional({
    description: 'Total de ingresos generados por el combo',
    example: 1125.00,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalIngresos?: number;
}

