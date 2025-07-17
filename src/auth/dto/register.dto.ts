import { IsEmail, IsString, MinLength, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../common/decorators/roles.decorator';

export class RegisterDto {
  @ApiProperty({
    description: 'Email del usuario',
    example: 'vendedor@francachela.com',
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
    example: 'Juan',
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  firstName: string;

  @ApiProperty({
    description: 'Apellido del usuario',
    example: 'Pérez',
  })
  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El apellido es requerido' })
  lastName: string;

  @ApiPropertyOptional({
    description: 'Rol del usuario',
    enum: UserRole,
    default: UserRole.VENDEDOR,
  })
  @IsOptional()
  @IsEnum(UserRole, { message: 'El rol debe ser administrador o vendedor' })
  role?: UserRole = UserRole.VENDEDOR;

  @ApiPropertyOptional({
    description: 'Teléfono del usuario',
    example: '+51987654321',
  })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  phone?: string;
}

