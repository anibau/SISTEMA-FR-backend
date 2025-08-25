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
import { GastosService } from './gastos.service';
import { CreateGastoDto, AprobarGastoDto, RechazarGastoDto, PagarGastoDto } from './dto/create-gasto.dto';
import { UpdateGastoDto } from './dto/update-gasto.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, UserRole } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CategoriaGasto, EstadoGasto } from './entities/gasto.entity';

@ApiTags('Gastos')
@Controller('gastos')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class GastosController {
  constructor(private readonly gastosService: GastosService) {}

  @Post()
  @Roles(UserRole.ADMINISTRADOR, UserRole.VENDEDOR)
  @ApiOperation({ 
    summary: 'Crear gasto',
    description: 'Registra un nuevo gasto en el sistema'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Gasto creado exitosamente'
  })
  create(@Body() createGastoDto: CreateGastoDto) {
    return this.gastosService.create(createGastoDto);
  }

  @Get()
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Listar gastos',
    description: 'Obtiene una lista paginada de gastos (solo administradores)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de gastos obtenida exitosamente'
  })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.gastosService.findAll(paginationDto);
  }

  @Get('mis-gastos')
  @ApiOperation({ 
    summary: 'Mis gastos',
    description: 'Obtiene los gastos registrados por el usuario actual'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Gastos del usuario obtenidos exitosamente'
  })
  findMisGastos(
    @CurrentUser() user: any,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.gastosService.findByUsuario(user.id, paginationDto);
  }

  @Get('usuario/:usuarioId')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Gastos por usuario',
    description: 'Obtiene los gastos de un usuario específico (solo administradores)'
  })
  @ApiParam({ name: 'usuarioId', description: 'ID del usuario' })
  @ApiResponse({ 
    status: 200, 
    description: 'Gastos del usuario obtenidos exitosamente'
  })
  findByUsuario(
    @Param('usuarioId') usuarioId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.gastosService.findByUsuario(usuarioId, paginationDto);
  }

  @Get('categoria/:categoria')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Gastos por categoría',
    description: 'Obtiene gastos filtrados por categoría (solo administradores)'
  })
  @ApiParam({ 
    name: 'categoria', 
    enum: CategoriaGasto,
    description: 'Categoría del gasto' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Gastos por categoría obtenidos exitosamente'
  })
  findByCategoria(@Param('categoria') categoria: CategoriaGasto) {
    return this.gastosService.findByCategoria(categoria);
  }

  @Get('estado/:estado')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Gastos por estado',
    description: 'Obtiene gastos filtrados por estado (solo administradores)'
  })
  @ApiParam({ 
    name: 'estado', 
    enum: EstadoGasto,
    description: 'Estado del gasto' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Gastos por estado obtenidos exitosamente'
  })
  findByEstado(@Param('estado') estado: EstadoGasto) {
    return this.gastosService.findByEstado(estado);
  }

  @Get('pendientes')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Gastos pendientes',
    description: 'Obtiene todos los gastos pendientes de aprobación (solo administradores)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Gastos pendientes obtenidos exitosamente'
  })
  findPendientes() {
    return this.gastosService.findPendientes();
  }

  @Get('aprobados')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Gastos aprobados',
    description: 'Obtiene todos los gastos aprobados pendientes de pago (solo administradores)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Gastos aprobados obtenidos exitosamente'
  })
  findAprobados() {
    return this.gastosService.findAprobados();
  }

  @Get('pagados')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Gastos pagados',
    description: 'Obtiene todos los gastos ya pagados (solo administradores)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Gastos pagados obtenidos exitosamente'
  })
  findPagados() {
    return this.gastosService.findPagados();
  }

  @Get('vencidos')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Gastos vencidos',
    description: 'Obtiene gastos que han superado los 30 días sin pagar (solo administradores)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Gastos vencidos obtenidos exitosamente'
  })
  findVencidos() {
    return this.gastosService.findVencidos();
  }

  @Get('recurrentes')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Gastos recurrentes',
    description: 'Obtiene todos los gastos configurados como recurrentes (solo administradores)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Gastos recurrentes obtenidos exitosamente'
  })
  findRecurrentes() {
    return this.gastosService.findRecurrentes();
  }

  @Get('mes/:mes/año/:año')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Gastos por mes y año',
    description: 'Obtiene gastos de un mes y año específicos (solo administradores)'
  })
  @ApiParam({ name: 'mes', description: 'Mes (1-12)' })
  @ApiParam({ name: 'año', description: 'Año (ej: 2024)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Gastos del período obtenidos exitosamente'
  })
  findByMesAño(@Param('mes') mes: number, @Param('año') año: number) {
    return this.gastosService.findByMesAño(mes, año);
  }

  @Get('rango-fechas')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Gastos por rango de fechas',
    description: 'Obtiene gastos en un rango de fechas específico (solo administradores)'
  })
  @ApiQuery({ name: 'fechaInicio', description: 'Fecha de inicio (YYYY-MM-DD)' })
  @ApiQuery({ name: 'fechaFin', description: 'Fecha de fin (YYYY-MM-DD)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Gastos del rango obtenidos exitosamente'
  })
  findByRangoFechas(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
  ) {
    return this.gastosService.findByRangoFechas(new Date(fechaInicio), new Date(fechaFin));
  }

  @Get('resumen/categoria')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Resumen por categoría',
    description: 'Obtiene resumen de gastos agrupados por categoría (solo administradores)'
  })
  @ApiQuery({ name: 'mes', required: false, description: 'Mes específico (1-12)' })
  @ApiQuery({ name: 'año', required: false, description: 'Año específico (ej: 2024)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Resumen por categoría obtenido exitosamente',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          categoria: { type: 'string', example: 'servicios' },
          totalGastos: { type: 'number', example: 15 },
          montoTotal: { type: 'number', example: 1250.75 },
          gastosAprobados: { type: 'number', example: 12 },
          gastosPagados: { type: 'number', example: 10 },
        }
      }
    }
  })
  obtenerResumenPorCategoria(
    @Query('mes') mes?: number,
    @Query('año') año?: number,
  ) {
    return this.gastosService.obtenerResumenPorCategoria(mes, año);
  }

  @Get('resumen/mensual/:año')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Resumen mensual',
    description: 'Obtiene resumen de gastos por cada mes del año (solo administradores)'
  })
  @ApiParam({ name: 'año', description: 'Año para el resumen (ej: 2024)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Resumen mensual obtenido exitosamente',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          mes: { type: 'number', example: 1 },
          nombreMes: { type: 'string', example: 'Enero' },
          totalGastos: { type: 'number', example: 25 },
          montoTotal: { type: 'number', example: 2150.50 },
          gastosPendientes: { type: 'number', example: 3 },
          gastosAprobados: { type: 'number', example: 5 },
          gastosPagados: { type: 'number', example: 17 },
        }
      }
    }
  })
  obtenerResumenMensual(@Param('año') año: number) {
    return this.gastosService.obtenerResumenMensual(año);
  }

  @Get('estadisticas')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Estadísticas de gastos',
    description: 'Obtiene estadísticas generales del sistema de gastos (solo administradores)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estadísticas obtenidas exitosamente',
    schema: {
      type: 'object',
      properties: {
        totalGastos: { type: 'number', example: 150 },
        gastosPendientes: { type: 'number', example: 12 },
        gastosAprobados: { type: 'number', example: 8 },
        gastosPagados: { type: 'number', example: 125 },
        gastosRechazados: { type: 'number', example: 5 },
        gastosVencidos: { type: 'number', example: 3 },
        montoTotalMes: { type: 'number', example: 2150.75 },
        montoTotalAño: { type: 'number', example: 18500.25 },
        categoriaMayorGasto: { type: 'string', example: 'servicios' },
        promedioGastoDiario: { type: 'number', example: 69.38 },
      }
    }
  })
  getEstadisticas() {
    return this.gastosService.getEstadisticas();
  }

  @Post('crear-recurrentes')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Crear gastos recurrentes',
    description: 'Genera automáticamente gastos recurrentes del mes actual (solo administradores)'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Gastos recurrentes creados exitosamente',
    schema: {
      type: 'object',
      properties: {
        gastosCreados: { type: 'number', example: 5 },
        gastosCreados_detalles: {
          type: 'array',
          items: { type: 'object' }
        }
      }
    }
  })
  crearGastosRecurrentes() {
    return this.gastosService.crearGastosRecurrentes();
  }

  @Get('numero/:numeroGasto')
  @ApiOperation({ 
    summary: 'Buscar por número de gasto',
    description: 'Obtiene un gasto por su número único'
  })
  @ApiParam({ name: 'numeroGasto', description: 'Número del gasto' })
  @ApiResponse({ 
    status: 200, 
    description: 'Gasto encontrado'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Gasto no encontrado'
  })
  findByNumeroGasto(@Param('numeroGasto') numeroGasto: string) {
    return this.gastosService.findByNumeroGasto(numeroGasto);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Obtener gasto por ID',
    description: 'Obtiene un gasto específico por su ID'
  })
  @ApiParam({ name: 'id', description: 'ID del gasto' })
  @ApiResponse({ 
    status: 200, 
    description: 'Gasto encontrado'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Gasto no encontrado'
  })
  findOne(@Param('id') id: string) {
    return this.gastosService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMINISTRADOR, UserRole.VENDEDOR)
  @ApiOperation({ 
    summary: 'Actualizar gasto',
    description: 'Actualiza un gasto (solo si está pendiente)'
  })
  @ApiParam({ name: 'id', description: 'ID del gasto' })
  @ApiResponse({ 
    status: 200, 
    description: 'Gasto actualizado exitosamente'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Solo se pueden modificar gastos pendientes'
  })
  update(@Param('id') id: string, @Body() updateGastoDto: UpdateGastoDto) {
    return this.gastosService.update(id, updateGastoDto);
  }

  @Patch(':id/aprobar')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Aprobar gasto',
    description: 'Aprueba un gasto pendiente (solo administradores)'
  })
  @ApiParam({ name: 'id', description: 'ID del gasto' })
  @ApiResponse({ 
    status: 200, 
    description: 'Gasto aprobado exitosamente'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Este gasto no puede ser aprobado'
  })
  aprobar(
    @Param('id') id: string,
    @Body() aprobarDto: AprobarGastoDto,
    @CurrentUser() user: any,
  ) {
    return this.gastosService.aprobar(id, user.id, user.nombre, aprobarDto);
  }

  @Patch(':id/rechazar')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Rechazar gasto',
    description: 'Rechaza un gasto pendiente con motivo (solo administradores)'
  })
  @ApiParam({ name: 'id', description: 'ID del gasto' })
  @ApiResponse({ 
    status: 200, 
    description: 'Gasto rechazado exitosamente'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Este gasto no puede ser rechazado'
  })
  rechazar(
    @Param('id') id: string,
    @Body() rechazarDto: RechazarGastoDto,
    @CurrentUser() user: any,
  ) {
    return this.gastosService.rechazar(id, user.id, user.nombre, rechazarDto);
  }

  @Patch(':id/pagar')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Marcar como pagado',
    description: 'Marca un gasto aprobado como pagado (solo administradores)'
  })
  @ApiParam({ name: 'id', description: 'ID del gasto' })
  @ApiResponse({ 
    status: 200, 
    description: 'Gasto marcado como pagado exitosamente'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Este gasto no puede ser marcado como pagado'
  })
  marcarComoPagado(@Param('id') id: string, @Body() pagarDto: PagarGastoDto) {
    return this.gastosService.marcarComoPagado(id, pagarDto);
  }

  @Post(':id/archivo')
  @Roles(UserRole.ADMINISTRADOR, UserRole.VENDEDOR)
  @ApiOperation({ 
    summary: 'Agregar archivo',
    description: 'Agrega un archivo adjunto al gasto'
  })
  @ApiParam({ name: 'id', description: 'ID del gasto' })
  @ApiResponse({ 
    status: 200, 
    description: 'Archivo agregado exitosamente'
  })
  agregarArchivo(
    @Param('id') id: string,
    @Body() body: {
      nombre: string;
      url: string;
      tipo: string;
      tamaño: number;
    },
  ) {
    return this.gastosService.agregarArchivo(
      id,
      body.nombre,
      body.url,
      body.tipo,
      body.tamaño,
    );
  }

  @Delete(':id/archivo/:nombreArchivo')
  @Roles(UserRole.ADMINISTRADOR, UserRole.VENDEDOR)
  @ApiOperation({ 
    summary: 'Remover archivo',
    description: 'Remueve un archivo adjunto del gasto'
  })
  @ApiParam({ name: 'id', description: 'ID del gasto' })
  @ApiParam({ name: 'nombreArchivo', description: 'Nombre del archivo a remover' })
  @ApiResponse({ 
    status: 200, 
    description: 'Archivo removido exitosamente'
  })
  removerArchivo(@Param('id') id: string, @Param('nombreArchivo') nombreArchivo: string) {
    return this.gastosService.removerArchivo(id, nombreArchivo);
  }

  @Delete(':id')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Eliminar gasto',
    description: 'Elimina (desactiva) un gasto (solo administradores, solo si está pendiente)'
  })
  @ApiParam({ name: 'id', description: 'ID del gasto' })
  @ApiResponse({ 
    status: 200, 
    description: 'Gasto eliminado exitosamente'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Solo se pueden eliminar gastos pendientes'
  })
  remove(@Param('id') id: string) {
    return this.gastosService.remove(id);
  }
}

