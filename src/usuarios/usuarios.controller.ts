import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, UserRole } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Usuarios')
@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Crear usuario',
    description: 'Crea un nuevo usuario en el sistema (solo administradores)'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Usuario creado exitosamente'
  })
  @ApiResponse({ 
    status: 409, 
    description: 'El email ya está registrado'
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Acceso denegado - Se requiere rol de administrador'
  })
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.create(createUsuarioDto);
  }

  @Get()
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Listar usuarios',
    description: 'Obtiene una lista paginada de todos los usuarios (solo administradores)'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Elementos por página' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de usuarios obtenida exitosamente'
  })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.usuariosService.findAll(paginationDto);
  }

  @Get('me')
  @ApiOperation({ 
    summary: 'Obtener mi perfil',
    description: 'Obtiene la información del perfil del usuario autenticado'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Perfil obtenido exitosamente'
  })
  getMyProfile(@CurrentUser('id') userId: string) {
    return this.usuariosService.findOne(userId);
  }

  @Get('stats')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Estadísticas de usuarios',
    description: 'Obtiene estadísticas generales de usuarios (solo administradores)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estadísticas obtenidas exitosamente',
    schema: {
      type: 'object',
      properties: {
        totalUsers: { type: 'number', example: 25 },
        activeUsers: { type: 'number', example: 23 },
        adminUsers: { type: 'number', example: 2 },
        vendedorUsers: { type: 'number', example: 21 },
      }
    }
  })
  async getStats() {
    const totalUsers = await this.usuariosService.getActiveUsersCount();
    const adminUsers = await this.usuariosService.getUsersByRole(UserRole.ADMINISTRADOR);
    const vendedorUsers = await this.usuariosService.getUsersByRole(UserRole.VENDEDOR);

    return {
      totalUsers,
      activeUsers: totalUsers,
      adminUsers: adminUsers.length,
      vendedorUsers: vendedorUsers.length,
    };
  }

  @Get('by-role/:role')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Usuarios por rol',
    description: 'Obtiene usuarios filtrados por rol (solo administradores)'
  })
  @ApiParam({ name: 'role', enum: UserRole, description: 'Rol a filtrar' })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuarios filtrados por rol'
  })
  getUsersByRole(@Param('role') role: string) {
    return this.usuariosService.getUsersByRole(role);
  }

  @Get(':id')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Obtener usuario por ID',
    description: 'Obtiene un usuario específico por su ID (solo administradores)'
  })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuario encontrado'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Usuario no encontrado'
  })
  findOne(@Param('id') id: string) {
    return this.usuariosService.findOne(id);
  }

  @Patch('me')
  @ApiOperation({ 
    summary: 'Actualizar mi perfil',
    description: 'Actualiza la información del perfil del usuario autenticado'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Perfil actualizado exitosamente'
  })
  updateMyProfile(
    @CurrentUser('id') userId: string,
    @Body() updateUsuarioDto: UpdateUsuarioDto
  ) {
    return this.usuariosService.update(userId, updateUsuarioDto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Actualizar usuario',
    description: 'Actualiza un usuario específico (solo administradores)'
  })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuario actualizado exitosamente'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Usuario no encontrado'
  })
  update(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuariosService.update(id, updateUsuarioDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Eliminar usuario',
    description: 'Elimina (desactiva) un usuario específico (solo administradores)'
  })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuario eliminado exitosamente'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Usuario no encontrado'
  })
  remove(@Param('id') id: string) {
    return this.usuariosService.remove(id);
  }

  @Get(':id/permissions')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Obtener permisos de usuario',
    description: 'Obtiene los permisos específicos de un usuario (solo administradores)'
  })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({ 
    status: 200, 
    description: 'Permisos obtenidos exitosamente'
  })
  getUserPermissions(@Param('id') id: string) {
    return this.usuariosService.getUserPermissions(id);
  }

  @Patch(':id/permissions')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Actualizar permisos de usuario',
    description: 'Actualiza los permisos específicos de un usuario (solo administradores)'
  })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({ 
    status: 200, 
    description: 'Permisos actualizados exitosamente'
  })
  updateUserPermissions(
    @Param('id') id: string,
    @Body() permissions: any
  ) {
    return this.usuariosService.updateUserPermissions(id, permissions);
  }
}

