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
import { NotificacionesService } from './notificaciones.service';
import { CreateNotificacionDto, MarcarLeidaDto, ArchivarNotificacionDto } from './dto/create-notificacion.dto';
import { UpdateNotificacionDto } from './dto/update-notificacion.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, UserRole } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { TipoNotificacion, PrioridadNotificacion, EstadoNotificacion } from './entities/notificacion.entity';

@ApiTags('Notificaciones')
@Controller('notificaciones')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class NotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) {}

  @Post()
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Crear notificación',
    description: 'Crea una nueva notificación en el sistema (solo administradores)'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Notificación creada exitosamente'
  })
  create(@Body() createNotificacionDto: CreateNotificacionDto) {
    return this.notificacionesService.create(createNotificacionDto);
  }

  @Get()
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Listar todas las notificaciones',
    description: 'Obtiene una lista paginada de todas las notificaciones (solo administradores)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de notificaciones obtenida exitosamente'
  })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.notificacionesService.findAll(paginationDto);
  }

  @Get('mis-notificaciones')
  @ApiOperation({ 
    summary: 'Mis notificaciones',
    description: 'Obtiene las notificaciones del usuario actual'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Notificaciones del usuario obtenidas exitosamente'
  })
  findMisNotificaciones(
    @CurrentUser() user: any,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.notificacionesService.findByUsuario(user.id, paginationDto);
  }

  @Get('usuario/:usuarioId')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Notificaciones por usuario',
    description: 'Obtiene las notificaciones de un usuario específico (solo administradores)'
  })
  @ApiParam({ name: 'usuarioId', description: 'ID del usuario' })
  @ApiResponse({ 
    status: 200, 
    description: 'Notificaciones del usuario obtenidas exitosamente'
  })
  findByUsuario(
    @Param('usuarioId') usuarioId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.notificacionesService.findByUsuario(usuarioId, paginationDto);
  }

  @Get('rol/:rol')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Notificaciones por rol',
    description: 'Obtiene notificaciones dirigidas a un rol específico (solo administradores)'
  })
  @ApiParam({ name: 'rol', description: 'Rol destinatario' })
  @ApiResponse({ 
    status: 200, 
    description: 'Notificaciones del rol obtenidas exitosamente'
  })
  findByRol(
    @Param('rol') rol: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.notificacionesService.findByRol(rol, paginationDto);
  }

  @Get('tipo/:tipo')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Notificaciones por tipo',
    description: 'Obtiene notificaciones filtradas por tipo (solo administradores)'
  })
  @ApiParam({ 
    name: 'tipo', 
    enum: TipoNotificacion,
    description: 'Tipo de notificación' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Notificaciones por tipo obtenidas exitosamente'
  })
  findByTipo(@Param('tipo') tipo: TipoNotificacion) {
    return this.notificacionesService.findByTipo(tipo);
  }

  @Get('prioridad/:prioridad')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Notificaciones por prioridad',
    description: 'Obtiene notificaciones filtradas por prioridad (solo administradores)'
  })
  @ApiParam({ 
    name: 'prioridad', 
    enum: PrioridadNotificacion,
    description: 'Prioridad de la notificación' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Notificaciones por prioridad obtenidas exitosamente'
  })
  findByPrioridad(@Param('prioridad') prioridad: PrioridadNotificacion) {
    return this.notificacionesService.findByPrioridad(prioridad);
  }

  @Get('estado/:estado')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Notificaciones por estado',
    description: 'Obtiene notificaciones filtradas por estado (solo administradores)'
  })
  @ApiParam({ 
    name: 'estado', 
    enum: EstadoNotificacion,
    description: 'Estado de la notificación' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Notificaciones por estado obtenidas exitosamente'
  })
  findByEstado(@Param('estado') estado: EstadoNotificacion) {
    return this.notificacionesService.findByEstado(estado);
  }

  @Get('pendientes')
  @ApiOperation({ 
    summary: 'Notificaciones pendientes',
    description: 'Obtiene las notificaciones pendientes del usuario actual'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Notificaciones pendientes obtenidas exitosamente'
  })
  findPendientes(@CurrentUser() user: any) {
    return this.notificacionesService.findPendientes(user.id);
  }

  @Get('criticas')
  @ApiOperation({ 
    summary: 'Notificaciones críticas',
    description: 'Obtiene todas las notificaciones con prioridad crítica'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Notificaciones críticas obtenidas exitosamente'
  })
  findCriticas() {
    return this.notificacionesService.findCriticas();
  }

  @Get('dashboard')
  @ApiOperation({ 
    summary: 'Notificaciones para dashboard',
    description: 'Obtiene notificaciones relevantes para mostrar en el dashboard'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Notificaciones del dashboard obtenidas exitosamente'
  })
  findParaDashboard(@CurrentUser() user: any) {
    return this.notificacionesService.findParaDashboard(user.id);
  }

  @Get('expiradas')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Notificaciones expiradas',
    description: 'Obtiene notificaciones que han expirado (solo administradores)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Notificaciones expiradas obtenidas exitosamente'
  })
  findExpiradas() {
    return this.notificacionesService.findExpiradas();
  }

  @Get('contadores')
  @ApiOperation({ 
    summary: 'Contadores de notificaciones',
    description: 'Obtiene contadores de notificaciones por estado y prioridad'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Contadores obtenidos exitosamente',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', example: 25 },
        pendientes: { type: 'number', example: 8 },
        leidas: { type: 'number', example: 15 },
        archivadas: { type: 'number', example: 2 },
        criticas: { type: 'number', example: 3 },
        altas: { type: 'number', example: 5 },
      }
    }
  })
  obtenerContadores(@CurrentUser() user: any) {
    return this.notificacionesService.obtenerContadores(user.id);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Obtener notificación por ID',
    description: 'Obtiene una notificación específica por su ID'
  })
  @ApiParam({ name: 'id', description: 'ID de la notificación' })
  @ApiResponse({ 
    status: 200, 
    description: 'Notificación encontrada'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Notificación no encontrada'
  })
  findOne(@Param('id') id: string) {
    return this.notificacionesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Actualizar notificación',
    description: 'Actualiza una notificación (solo administradores)'
  })
  @ApiParam({ name: 'id', description: 'ID de la notificación' })
  @ApiResponse({ 
    status: 200, 
    description: 'Notificación actualizada exitosamente'
  })
  update(@Param('id') id: string, @Body() updateNotificacionDto: UpdateNotificacionDto) {
    return this.notificacionesService.update(id, updateNotificacionDto);
  }

  @Patch(':id/marcar-leida')
  @ApiOperation({ 
    summary: 'Marcar como leída',
    description: 'Marca una notificación como leída'
  })
  @ApiParam({ name: 'id', description: 'ID de la notificación' })
  @ApiResponse({ 
    status: 200, 
    description: 'Notificación marcada como leída exitosamente'
  })
  marcarComoLeida(@Param('id') id: string) {
    return this.notificacionesService.marcarComoLeida(id);
  }

  @Patch('marcar-varias-leidas')
  @ApiOperation({ 
    summary: 'Marcar varias como leídas',
    description: 'Marca múltiples notificaciones como leídas'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Notificaciones marcadas como leídas exitosamente',
    schema: {
      type: 'object',
      properties: {
        actualizadas: { type: 'number', example: 5 }
      }
    }
  })
  marcarVariasComoLeidas(@Body() marcarLeidaDto: MarcarLeidaDto) {
    return this.notificacionesService.marcarVariasComoLeidas(marcarLeidaDto.notificacionIds || []);
  }

  @Patch('marcar-todas-leidas')
  @ApiOperation({ 
    summary: 'Marcar todas como leídas',
    description: 'Marca todas las notificaciones pendientes del usuario como leídas'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Todas las notificaciones marcadas como leídas exitosamente',
    schema: {
      type: 'object',
      properties: {
        actualizadas: { type: 'number', example: 12 }
      }
    }
  })
  marcarTodasComoLeidas(@CurrentUser() user: any) {
    return this.notificacionesService.marcarTodasComoLeidas(user.id);
  }

  @Patch(':id/archivar')
  @ApiOperation({ 
    summary: 'Archivar notificación',
    description: 'Archiva una notificación'
  })
  @ApiParam({ name: 'id', description: 'ID de la notificación' })
  @ApiResponse({ 
    status: 200, 
    description: 'Notificación archivada exitosamente'
  })
  archivar(@Param('id') id: string) {
    return this.notificacionesService.archivar(id);
  }

  @Patch('archivar-varias')
  @ApiOperation({ 
    summary: 'Archivar varias notificaciones',
    description: 'Archiva múltiples notificaciones'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Notificaciones archivadas exitosamente',
    schema: {
      type: 'object',
      properties: {
        archivadas: { type: 'number', example: 3 }
      }
    }
  })
  archivarVarias(@Body() archivarDto: ArchivarNotificacionDto) {
    return this.notificacionesService.archivarVarias(archivarDto.notificacionIds || []);
  }

  @Patch(':id/restaurar')
  @ApiOperation({ 
    summary: 'Restaurar notificación',
    description: 'Restaura una notificación archivada'
  })
  @ApiParam({ name: 'id', description: 'ID de la notificación' })
  @ApiResponse({ 
    status: 200, 
    description: 'Notificación restaurada exitosamente'
  })
  restaurar(@Param('id') id: string) {
    return this.notificacionesService.restaurar(id);
  }

  @Post('limpiar-expiradas')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Limpiar notificaciones expiradas',
    description: 'Elimina automáticamente las notificaciones expiradas (solo administradores)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Notificaciones expiradas eliminadas exitosamente',
    schema: {
      type: 'object',
      properties: {
        eliminadas: { type: 'number', example: 7 }
      }
    }
  })
  limpiarExpiradas() {
    return this.notificacionesService.limpiarExpiradas();
  }

  @Post('stock-bajo')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Crear notificación de stock bajo',
    description: 'Crea una notificación específica para stock bajo (solo administradores)'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Notificación de stock bajo creada exitosamente'
  })
  crearNotificacionStockBajo(@Body() body: {
    productoId: string;
    productoNombre: string;
    stockActual: number;
    stockMinimo: number;
  }) {
    return this.notificacionesService.crearNotificacionStockBajo(
      body.productoId,
      body.productoNombre,
      body.stockActual,
      body.stockMinimo,
    );
  }

  @Post('producto-agotado')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Crear notificación de producto agotado',
    description: 'Crea una notificación específica para producto agotado (solo administradores)'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Notificación de producto agotado creada exitosamente'
  })
  crearNotificacionProductoAgotado(@Body() body: {
    productoId: string;
    productoNombre: string;
  }) {
    return this.notificacionesService.crearNotificacionProductoAgotado(
      body.productoId,
      body.productoNombre,
    );
  }

  @Post('venta-realizada')
  @Roles(UserRole.ADMINISTRADOR, UserRole.VENDEDOR)
  @ApiOperation({ 
    summary: 'Crear notificación de venta realizada',
    description: 'Crea una notificación para una venta realizada'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Notificación de venta creada exitosamente'
  })
  crearNotificacionVentaRealizada(@Body() body: {
    ventaId: string;
    monto: number;
    clienteNombre?: string;
  }) {
    return this.notificacionesService.crearNotificacionVentaRealizada(
      body.ventaId,
      body.monto,
      body.clienteNombre,
    );
  }

  @Post('cumpleanos')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Crear notificación de cumpleaños',
    description: 'Crea una notificación para cumpleaños de cliente (solo administradores)'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Notificación de cumpleaños creada exitosamente'
  })
  crearNotificacionCumpleanos(@Body() body: {
    clienteId: string;
    clienteNombre: string;
  }) {
    return this.notificacionesService.crearNotificacionCumpleanos(
      body.clienteId,
      body.clienteNombre,
    );
  }

  @Post('delivery-atrasado')
  @Roles(UserRole.ADMINISTRADOR, UserRole.VENDEDOR)
  @ApiOperation({ 
    summary: 'Crear notificación de delivery atrasado',
    description: 'Crea una notificación para delivery atrasado'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Notificación de delivery atrasado creada exitosamente'
  })
  crearNotificacionDeliveryAtrasado(@Body() body: {
    deliveryId: string;
    numeroPedido: string;
    clienteNombre: string;
  }) {
    return this.notificacionesService.crearNotificacionDeliveryAtrasado(
      body.deliveryId,
      body.numeroPedido,
      body.clienteNombre,
    );
  }

  @Delete(':id')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Eliminar notificación',
    description: 'Elimina (desactiva) una notificación (solo administradores)'
  })
  @ApiParam({ name: 'id', description: 'ID de la notificación' })
  @ApiResponse({ 
    status: 200, 
    description: 'Notificación eliminada exitosamente'
  })
  remove(@Param('id') id: string) {
    return this.notificacionesService.remove(id);
  }
}

