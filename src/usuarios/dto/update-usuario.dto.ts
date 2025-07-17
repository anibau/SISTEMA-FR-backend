import { PartialType, OmitType } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateUsuarioDto } from './create-usuario.dto';

export class UpdateUsuarioDto extends PartialType(
  OmitType(CreateUsuarioDto, ['email', 'password'] as const)
) {
  @ApiPropertyOptional({
    description: 'Estado activo del usuario',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'El estado activo debe ser un valor booleano' })
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Preferencias del usuario',
    type: 'object',
    properties: {
      theme: { type: 'string', enum: ['light', 'dark'], example: 'light' },
      language: { type: 'string', example: 'es' },
      notifications: { type: 'boolean', example: true },
      autoSave: { type: 'boolean', example: true },
    },
  })
  @IsOptional()
  preferences?: {
    theme: 'light' | 'dark';
    language: string;
    notifications: boolean;
    autoSave: boolean;
  };
}

