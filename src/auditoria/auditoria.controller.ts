import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  ParseIntPipe,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AuditoriaService } from './auditoria.service';
import { CreateAuditoriaDto } from './dto/create-auditoria.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../usuarios/entities/usuario.entity';
import { Auditoria, TipoAccion, TipoEntidad } from './entities/auditoria.entity';

@ApiTags('auditoria')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('auditoria')
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Post()
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Crear un registro de auditoría manual' })
  @ApiResponse({
    status: 201,
    description: 'Registro de auditoría creado exitosamente',
    type: Auditoria,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(@Body() createAuditoriaDto: CreateAuditoriaDto) {
    return this.auditoriaService.create(createAuditoriaDto);
  }

  @Get()
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Obtener todos los registros de auditoría con filtros' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Elementos por página' })
  @ApiQuery({ name: 'accion', required: false, enum: TipoAccion, description: 'Filtrar por acción' })
  @ApiQuery({ name: 'entidad', required: false, enum: TipoEntidad, description: 'Filtrar por entidad' })
  @ApiQuery({ name: 'usuarioId', required: false, type: String, description: 'Filtrar por usuario' })
  @ApiQuery({ name: 'entidadId', required: false, type: String, description: 'Filtrar por ID de entidad' })
  @ApiQuery({ name: 'fechaInicio', required: false, type: String, description: 'Fecha inicio (YYYY-MM-DD)' })
  @ApiQuery({ name: 'fechaFin', required: false, type: String, description: 'Fecha fin (YYYY-MM-DD)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de registros de auditoría obtenida exitosamente',
  })
  findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('accion') accion?: TipoAccion,
    @Query('entidad') entidad?: TipoEntidad,
    @Query('usuarioId') usuarioId?: string,
    @Query('entidadId') entidadId?: string,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ) {
    const filters = {
      accion,
      entidad,
      usuarioId,
      entidadId,
      fechaInicio: fechaInicio ? new Date(fechaInicio) : undefined,
      fechaFin: fechaFin ? new Date(fechaFin) : undefined,
    };

    return this.auditoriaService.findAll(page, limit, filters);
  }

  @Get('actividad-reciente')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Obtener actividad reciente del sistema' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Límite de resultados' })
  @ApiResponse({
    status: 200,
    description: 'Actividad reciente obtenida exitosamente',
  })
  getActividadReciente(
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
  ) {
    return this.auditoriaService.getActividadReciente(limit);
  }

  @Get('estadisticas/periodo')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Obtener estadísticas de auditoría por período' })
  @ApiQuery({ name: 'fechaInicio', required: true, type: String, description: 'Fecha inicio (YYYY-MM-DD)' })
  @ApiQuery({ name: 'fechaFin', required: true, type: String, description: 'Fecha fin (YYYY-MM-DD)' })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas por período',
  })
  getEstadisticasPorPeriodo(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
  ) {
    return this.auditoriaService.getEstadisticasPorPeriodo(
      new Date(fechaInicio),
      new Date(fechaFin)
    );
  }

  @Get('estadisticas/usuarios-activos')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Obtener usuarios más activos' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Límite de resultados' })
  @ApiResponse({
    status: 200,
    description: 'Usuarios más activos',
  })
  getUsuariosMasActivos(
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ) {
    return this.auditoriaService.getUsuariosMasActivos(limit);
  }

  @Get('estadisticas/acciones-por-dia')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Obtener acciones por día' })
  @ApiQuery({ name: 'dias', required: false, type: Number, description: 'Número de días hacia atrás' })
  @ApiResponse({
    status: 200,
    description: 'Acciones por día',
  })
  getAccionesPorDia(
    @Query('dias', new ParseIntPipe({ optional: true })) dias: number = 30,
  ) {
    return this.auditoriaService.getAccionesPorDia(dias);
  }

  @Get('exportar')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Exportar registros de auditoría' })
  @ApiQuery({ name: 'fechaInicio', required: true, type: String, description: 'Fecha inicio (YYYY-MM-DD)' })
  @ApiQuery({ name: 'fechaFin', required: true, type: String, description: 'Fecha fin (YYYY-MM-DD)' })
  @ApiQuery({ name: 'formato', required: false, enum: ['json', 'csv'], description: 'Formato de exportación' })
  @ApiResponse({
    status: 200,
    description: 'Datos exportados exitosamente',
  })
  exportarAuditoria(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
    @Query('formato') formato: 'json' | 'csv' = 'json',
  ) {
    return this.auditoriaService.exportarAuditoria(
      new Date(fechaInicio),
      new Date(fechaFin),
      formato
    );
  }

  @Get('entidad/:entidad/:entidadId')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Obtener historial de auditoría de una entidad específica' })
  @ApiResponse({
    status: 200,
    description: 'Historial de la entidad obtenido exitosamente',
  })
  findByEntidad(
    @Param('entidad') entidad: TipoEntidad,
    @Param('entidadId', ParseUUIDPipe) entidadId: string,
  ) {
    return this.auditoriaService.findByEntidad(entidad, entidadId);
  }

  @Get('usuario/:usuarioId')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Obtener historial de auditoría de un usuario específico' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Elementos por página' })
  @ApiResponse({
    status: 200,
    description: 'Historial del usuario obtenido exitosamente',
  })
  findByUsuario(
    @Param('usuarioId', ParseUUIDPipe) usuarioId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ) {
    return this.auditoriaService.findByUsuario(usuarioId, page, limit);
  }

  @Get(':id')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Obtener un registro de auditoría por ID' })
  @ApiResponse({
    status: 200,
    description: 'Registro de auditoría encontrado',
    type: Auditoria,
  })
  @ApiResponse({ status: 404, description: 'Registro no encontrado' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.auditoriaService.findOne(id);
  }

  @Post('acceso')
  @Roles(Role.ADMINISTRADOR, Role.VENDEDOR)
  @ApiOperation({ summary: 'Registrar acceso de usuario' })
  @ApiResponse({
    status: 201,
    description: 'Acceso registrado exitosamente',
  })
  registrarAcceso(
    @Body() body: { usuarioId: string; ip?: string; userAgent?: string },
  ) {
    return this.auditoriaService.registrarAcceso(
      body.usuarioId,
      body.ip,
      body.userAgent,
    );
  }

  @Post('cierre-sesion')
  @Roles(Role.ADMINISTRADOR, Role.VENDEDOR)
  @ApiOperation({ summary: 'Registrar cierre de sesión' })
  @ApiResponse({
    status: 201,
    description: 'Cierre de sesión registrado exitosamente',
  })
  registrarCierreSesion(
    @Body() body: { usuarioId: string; ip?: string },
  ) {
    return this.auditoriaService.registrarCierreSesion(body.usuarioId, body.ip);
  }

  @Delete('limpiar/:dias')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Limpiar registros antiguos de auditoría' })
  @ApiResponse({
    status: 200,
    description: 'Registros limpiados exitosamente',
  })
  limpiarRegistrosAntiguos(
    @Param('dias', ParseIntPipe) dias: number,
  ) {
    return this.auditoriaService.limpiarRegistrosAntiguos(dias);
  }
}

