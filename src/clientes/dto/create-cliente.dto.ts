import { IsString, IsOptional, IsEnum, IsEmail, IsDateString, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoDocumento } from '../entities/cliente.entity';

export class CreateClienteDto {
  @ApiProperty({
    description: 'Nombres del cliente',
    example: 'Juan Carlos',
  })
  @IsString()
  nombres: string;

  @ApiProperty({
    description: 'Apellidos del cliente',
    example: 'Pérez García',
  })
  @IsString()
  apellidos: string;

  @ApiProperty({
    description: 'Tipo de documento',
    enum: TipoDocumento,
    example: TipoDocumento.DNI,
  })
  @IsEnum(TipoDocumento)
  tipoDocumento: TipoDocumento;

  @ApiProperty({
    description: 'Número de documento',
    example: '12345678',
  })
  @IsString()
  numeroDocumento: string;

  @ApiPropertyOptional({
    description: 'Correo electrónico',
    example: 'juan.perez@email.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Número de teléfono',
    example: '+51987654321',
  })
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiPropertyOptional({
    description: 'Número de WhatsApp',
    example: '+51987654321',
  })
  @IsOptional()
  @IsString()
  whatsapp?: string;

  @ApiPropertyOptional({
    description: 'Fecha de nacimiento',
    example: '1990-05-15',
  })
  @IsOptional()
  @IsDateString()
  fechaNacimiento?: string;

  @ApiPropertyOptional({
    description: 'Dirección principal',
    example: 'Av. Principal 123, Lima',
  })
  @IsOptional()
  @IsString()
  direccion?: string;

  @ApiPropertyOptional({
    description: 'Distrito',
    example: 'San Isidro',
  })
  @IsOptional()
  @IsString()
  distrito?: string;

  @ApiPropertyOptional({
    description: 'Provincia',
    example: 'Lima',
  })
  @IsOptional()
  @IsString()
  provincia?: string;

  @ApiPropertyOptional({
    description: 'Departamento',
    example: 'Lima',
  })
  @IsOptional()
  @IsString()
  departamento?: string;

  @ApiPropertyOptional({
    description: 'Referencia de ubicación',
    example: 'Frente al parque principal',
  })
  @IsOptional()
  @IsString()
  referencia?: string;

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

  @ApiPropertyOptional({
    description: 'Límite de crédito',
    example: 500.00,
  })
  @IsOptional()
  @IsNumber()
  limiteCredito?: number;

  @ApiPropertyOptional({
    description: 'Días de crédito permitidos',
    example: 30,
  })
  @IsOptional()
  @IsNumber()
  diasCredito?: number;

  // @ApiPropertyOptional({
  //   description: 'Si el cliente es VIP',
  //   example: false,
  // })
  // @IsOptional()
  // @IsBoolean()
  // esVip?: boolean; // No existe en la entidad

  @ApiPropertyOptional({
    description: 'Observaciones adicionales',
    example: 'Cliente frecuente, prefiere delivery',
  })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
