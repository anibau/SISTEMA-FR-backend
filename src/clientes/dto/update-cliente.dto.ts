import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateClienteDto } from './create-cliente.dto';

export class UpdateClienteDto extends PartialType(CreateClienteDto) {
  @ApiPropertyOptional({
    description: 'Puntos acumulados del cliente',
    example: 150,
  })
  @IsOptional()
  @IsNumber()
  puntosAcumulados?: number;

  @ApiPropertyOptional({
    description: 'Monto total de compras',
    example: 1250.50,
  })
  @IsOptional()
  @IsNumber()
  montoTotalCompras?: number;

  @ApiPropertyOptional({
    description: 'Deuda actual del cliente',
    example: 75.00,
  })
  @IsOptional()
  @IsNumber()
  deudaActual?: number;

  @ApiPropertyOptional({
    description: 'Si el cliente está activo',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

