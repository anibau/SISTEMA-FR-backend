import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles, UserRole } from '../common/decorators/roles.decorator';
import { Public } from './decorators/public.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Iniciar sesión',
    description: 'Autentica un usuario y devuelve un token JWT'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Login exitoso',
    type: AuthResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Credenciales inválidas'
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('register')
  @ApiOperation({ 
    summary: 'Registrar usuario',
    description: 'Registra un nuevo usuario en el sistema'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Usuario registrado exitosamente',
    type: AuthResponseDto
  })
  @ApiResponse({ 
    status: 409, 
    description: 'El email ya está registrado'
  })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Obtener perfil',
    description: 'Obtiene la información del perfil del usuario autenticado'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Perfil obtenido exitosamente'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado'
  })
  async getProfile(@CurrentUser('id') userId: string) {
    return this.authService.getProfile(userId);
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Renovar token',
    description: 'Genera un nuevo token JWT para el usuario autenticado'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Token renovado exitosamente',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
        expiresIn: { type: 'number' }
      }
    }
  })
  async refreshToken(@CurrentUser('id') userId: string) {
    return this.authService.refreshToken(userId);
  }

  @Get('admin-only')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMINISTRADOR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Endpoint solo para administradores',
    description: 'Endpoint de prueba que solo pueden acceder los administradores'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Acceso autorizado para administrador'
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Acceso denegado - Se requiere rol de administrador'
  })
  async adminOnly(@CurrentUser() user: any) {
    return {
      message: 'Acceso autorizado para administrador',
      user: user,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('vendedor-access')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VENDEDOR, UserRole.ADMINISTRADOR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Endpoint para vendedores y administradores',
    description: 'Endpoint que pueden acceder vendedores y administradores'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Acceso autorizado'
  })
  async vendedorAccess(@CurrentUser() user: any) {
    return {
      message: 'Acceso autorizado para vendedor/administrador',
      user: user,
      timestamp: new Date().toISOString(),
    };
  }
}

