import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../common/decorators/roles.decorator';

export class AuthResponseDto {
  @ApiProperty({
    description: 'Token JWT de acceso',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Tipo de token',
    example: 'Bearer',
  })
  tokenType: string;

  @ApiProperty({
    description: 'Tiempo de expiración en segundos',
    example: 86400,
  })
  expiresIn: number;

  @ApiProperty({
    description: 'Información del usuario autenticado',
    type: 'object',
    properties: {
      id: { type: 'string', example: 'uuid-string' },
      email: { type: 'string', example: 'admin@francachela.com' },
      firstName: { type: 'string', example: 'Juan' },
      lastName: { type: 'string', example: 'Pérez' },
      role: { type: 'string', enum: Object.values(UserRole), example: UserRole.ADMINISTRADOR },
      fullName: { type: 'string', example: 'Juan Pérez' },
    },
  })
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    fullName: string;
  };
}

