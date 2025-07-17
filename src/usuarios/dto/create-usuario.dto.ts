import { IsEmail, IsString, MinLength, IsNotEmpty, IsEnum, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../common/decorators/roles.decorator';

export class CreateUsuarioDto {
  @ApiProperty({
    description: 'Email del usuario',
    example: 'nuevo.vendedor@francachela.com',
  })
  @IsEmail({}, { message: 'Debe ser un email válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'password123',
    minLength: 6,
  })
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  password: string;

  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'María',
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  firstName: string;

  @ApiProperty({
    description: 'Apellido del usuario',
    example: 'González',
  })
  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El apellido es requerido' })
  lastName: string;

  @ApiProperty({
    description: 'Rol del usuario',
    enum: UserRole,
    example: UserRole.VENDEDOR,
  })
  @IsEnum(UserRole, { message: 'El rol debe ser administrador o vendedor' })
  role: UserRole;

  @ApiPropertyOptional({
    description: 'Teléfono del usuario',
    example: '+51987654321',
  })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Biografía del usuario',
    example: 'Vendedor especializado en vinos y licores premium',
  })
  @IsOptional()
  @IsString({ message: 'La biografía debe ser una cadena de texto' })
  bio?: string;

  @ApiPropertyOptional({
    description: 'Permisos específicos del usuario',
    type: 'object',
    properties: {
      canCreateProducts: { type: 'boolean', example: true },
      canEditPrices: { type: 'boolean', example: false },
      canDeleteSales: { type: 'boolean', example: false },
      canViewReports: { type: 'boolean', example: true },
      canManageUsers: { type: 'boolean', example: false },
      canManagePromotions: { type: 'boolean', example: false },
      canAccessDelivery: { type: 'boolean', example: true },
      canManageClients: { type: 'boolean', example: true },
    },
  })
  @IsOptional()
  @IsObject({ message: 'Los permisos deben ser un objeto válido' })
  permissions?: {
    canCreateProducts: boolean;
    canEditPrices: boolean;
    canDeleteSales: boolean;
    canViewReports: boolean;
    canManageUsers: boolean;
    canManagePromotions: boolean;
    canAccessDelivery: boolean;
    canManageClients: boolean;
  };
}

