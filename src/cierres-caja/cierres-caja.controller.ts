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
import { CierresCajaService } from './cierres-caja.service';
import {
  CreateCierreCajaDto,
  CerrarCajaDto,
  CreateMovimientoCajaDto,
  RevisarCierreDto,
  AprobarCierreDto,
} from './dto/create-cierre-caja.dto';
import { UpdateCierreCajaDto } from './dto/update-cierre-caja.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, UserRole } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { EstadoCierre } from './entities/cierre-caja.entity';

@ApiTags('Cierres de Caja')
@Controller('cierres-caja')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class CierresCajaController {
  constructor(private readonly cierresCajaService: CierresCajaService) {}

  @Post('abrir')
  @Roles(UserRole.ADMINISTRADOR, UserRole.VENDEDOR)
  @ApiOperation({ 
    summary: 'Abrir caja',
    description: 'Abre una nueva caja para el turno del usuario'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Caja abierta exitosamente'
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Ya tienes una caja abierta'
  })
  abrirCaja(@Body() createDto: CreateCierreCajaDto) {
    return this.cierresCajaService.abrirCaja(createDto);
  }

  @Patch(':id/cerrar')
  @Roles(UserRole.ADMINISTRADOR, UserRole.VENDEDOR)
  @ApiOperation({ 
    summary: 'Cerrar caja',
    description: 'Cierra una caja abierta con el conteo final'
  })
  @ApiParam({ name: 'id', description: 'ID del cierre de caja' })
  @ApiResponse({ 
    status: 200, 
    description: 'Caja cerrada exitosamente'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Solo se pueden cerrar cajas abiertas'
  })
  cerrarCaja(@Param('id') id: string, @Body() cerrarDto: CerrarCajaDto) {
    return this.cierresCajaService.cerrarCaja(id, cerrarDto);
  }

  @Get()
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Listar cierres de caja',
    description: 'Obtiene una lista paginada de cierres de caja (solo administradores)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de cierres obtenida exitosamente'
  })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.cierresCajaService.findAll(paginationDto);
  }

  @Get('mis-cierres')
  @ApiOperation({ 
    summary: 'Mis cierres de caja',
    description: 'Obtiene los cierres de caja del usuario actual'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Cierres del usuario obtenidos exitosamente'
  })
  findMisCierres(
    @CurrentUser() user: any,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.cierresCajaService.findByUsuario(user.id, paginationDto);
  }

  @Get('usuario/:usuarioId')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Cierres por usuario',
    description: 'Obtiene los cierres de caja de un usuario específico (solo administradores)'
  })
  @ApiParam({ name: 'usuarioId', description: 'ID del usuario' })
  @ApiResponse({ 
    status: 200, 
    description: 'Cierres del usuario obtenidos exitosamente'
  })
  findByUsuario(
    @Param('usuarioId') usuarioId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.cierresCajaService.findByUsuario(usuarioId, paginationDto);
  }

  @Get('estado/:estado')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Cierres por estado',
    description: 'Obtiene cierres filtrados por estado (solo administradores)'
  })
  @ApiParam({ 
    name: 'estado', 
    enum: EstadoCierre,
    description: 'Estado del cierre' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Cierres por estado obtenidos exitosamente'
  })
  findByEstado(@Param('estado') estado: EstadoCierre) {
    return this.cierresCajaService.findByEstado(estado);
  }

  @Get('abiertas')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Cajas abiertas',
    description: 'Obtiene todas las cajas actualmente abiertas (solo administradores)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Cajas abiertas obtenidas exitosamente'
  })
  findCajasAbiertas() {
    return this.cierresCajaService.findCajasAbiertas();
  }

  @Get('pendientes-revision')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Cajas pendientes de revisión',
    description: 'Obtiene cajas cerradas pendientes de revisión (solo administradores)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Cajas pendientes obtenidas exitosamente'
  })
  findPendientesRevision() {
    return this.cierresCajaService.findCajasPendientesRevision();
  }

  @Get('con-desbalance')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Cajas con desbalance',
    description: 'Obtiene cajas que tienen diferencias en el conteo (solo administradores)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Cajas con desbalance obtenidas exitosamente'
  })
  findConDesbalance() {
    return this.cierresCajaService.findCajasConDesbalance();
  }

  @Get('resumen-diario')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Resumen diario',
    description: 'Obtiene el resumen de cierres de caja del día (solo administradores)'
  })
  @ApiQuery({ 
    name: 'fecha', 
    required: false, 
    description: 'Fecha en formato YYYY-MM-DD (por defecto hoy)' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Resumen diario obtenido exitosamente',
    schema: {
      type: 'object',
      properties: {
        fecha: { type: 'string', example: '2024-01-15' },
        totalCierres: { type: 'number', example: 5 },
        cierresAbiertos: { type: 'number', example: 2 },
        cierresCerrados: { type: 'number', example: 2 },
        cierresAprobados: { type: 'number', example: 1 },
        totalVentas: { type: 'number', example: 45 },
        totalIngresos: { type: 'number', example: 1250.75 },
        totalGastos: { type: 'number', example: 85.50 },
        totalDiferencias: { type: 'number', example: 12.25 },
        cierresConDesbalance: { type: 'number', example: 1 },
      }
    }
  })
  obtenerResumenDiario(@Query('fecha') fecha?: string) {
    const fechaConsulta = fecha ? new Date(fecha) : undefined;
    return this.cierresCajaService.obtenerResumenDiario(fechaConsulta);
  }

  @Get('estadisticas')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Estadísticas de cierres',
    description: 'Obtiene estadísticas generales del sistema de cierres (solo administradores)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estadísticas obtenidas exitosamente',
    schema: {
      type: 'object',
      properties: {
        cierresHoy: { type: 'number', example: 8 },
        cierresAbiertos: { type: 'number', example: 3 },
        cierresPendientesRevision: { type: 'number', example: 2 },
        cierresConDesbalance: { type: 'number', example: 1 },
        promedioVentasPorCierre: { type: 'number', example: 12.5 },
        promedioTiempoOperacion: { type: 'number', example: 480 },
        totalDiferenciasHoy: { type: 'number', example: 5.75 },
        metodoPagoMasUsado: { type: 'string', example: 'Efectivo' },
      }
    }
  })
  getEstadisticas() {
    return this.cierresCajaService.getEstadisticas();
  }

  @Get('numero/:numeroCierre')
  @ApiOperation({ 
    summary: 'Buscar por número de cierre',
    description: 'Obtiene un cierre por su número único'
  })
  @ApiParam({ name: 'numeroCierre', description: 'Número del cierre' })
  @ApiResponse({ 
    status: 200, 
    description: 'Cierre encontrado'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Cierre no encontrado'
  })
  findByNumeroCierre(@Param('numeroCierre') numeroCierre: string) {
    return this.cierresCajaService.findByNumeroCierre(numeroCierre);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Obtener cierre por ID',
    description: 'Obtiene un cierre específico por su ID'
  })
  @ApiParam({ name: 'id', description: 'ID del cierre' })
  @ApiResponse({ 
    status: 200, 
    description: 'Cierre encontrado'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Cierre no encontrado'
  })
  findOne(@Param('id') id: string) {
    return this.cierresCajaService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMINISTRADOR, UserRole.VENDEDOR)
  @ApiOperation({ 
    summary: 'Actualizar cierre',
    description: 'Actualiza un cierre de caja (solo si está abierto)'
  })
  @ApiParam({ name: 'id', description: 'ID del cierre' })
  @ApiResponse({ 
    status: 200, 
    description: 'Cierre actualizado exitosamente'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Solo se pueden modificar cajas abiertas'
  })
  update(@Param('id') id: string, @Body() updateDto: UpdateCierreCajaDto) {
    return this.cierresCajaService.update(id, updateDto);
  }

  @Patch(':id/revisar')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Revisar cierre',
    description: 'Marca un cierre como revisado (solo administradores)'
  })
  @ApiParam({ name: 'id', description: 'ID del cierre' })
  @ApiResponse({ 
    status: 200, 
    description: 'Cierre revisado exitosamente'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Solo se pueden revisar cajas cerradas'
  })
  revisar(
    @Param('id') id: string,
    @Body() revisarDto: RevisarCierreDto,
    @CurrentUser() user: any,
  ) {
    return this.cierresCajaService.revisar(
      id,
      user.id,
      user.nombre,
      revisarDto.observaciones,
    );
  }

  @Patch(':id/aprobar')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Aprobar cierre',
    description: 'Marca un cierre como aprobado (solo administradores)'
  })
  @ApiParam({ name: 'id', description: 'ID del cierre' })
  @ApiResponse({ 
    status: 200, 
    description: 'Cierre aprobado exitosamente'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Solo se pueden aprobar cajas revisadas'
  })
  aprobar(
    @Param('id') id: string,
    @Body() aprobarDto: AprobarCierreDto,
    @CurrentUser() user: any,
  ) {
    return this.cierresCajaService.aprobar(
      id,
      user.id,
      user.nombre,
      aprobarDto.observaciones,
    );
  }

  @Post('movimiento')
  @Roles(UserRole.ADMINISTRADOR, UserRole.VENDEDOR)
  @ApiOperation({ 
    summary: 'Crear movimiento de caja',
    description: 'Registra un movimiento manual en la caja'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Movimiento creado exitosamente'
  })
  crearMovimiento(@Body() createDto: CreateMovimientoCajaDto) {
    return this.cierresCajaService.crearMovimiento(createDto);
  }

  @Get(':id/movimientos')
  @ApiOperation({ 
    summary: 'Movimientos de caja',
    description: 'Obtiene todos los movimientos de un cierre específico'
  })
  @ApiParam({ name: 'id', description: 'ID del cierre de caja' })
  @ApiResponse({ 
    status: 200, 
    description: 'Movimientos obtenidos exitosamente'
  })
  obtenerMovimientos(@Param('id') id: string) {
    return this.cierresCajaService.obtenerMovimientos(id);
  }

  @Post(':id/registrar-venta')
  @Roles(UserRole.ADMINISTRADOR, UserRole.VENDEDOR)
  @ApiOperation({ 
    summary: 'Registrar venta en caja',
    description: 'Registra una venta en el cierre de caja activo'
  })
  @ApiParam({ name: 'id', description: 'ID del cierre de caja' })
  @ApiResponse({ 
    status: 200, 
    description: 'Venta registrada exitosamente'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'No se pueden registrar ventas en una caja cerrada'
  })
  registrarVenta(
    @Param('id') id: string,
    @Body() body: {
      ventaId: string;
      numeroTicket: string;
      monto: number;
      metodoPago: string;
    },
  ) {
    return this.cierresCajaService.registrarVenta(
      id,
      body.ventaId,
      body.numeroTicket,
      body.monto,
      body.metodoPago,
    );
  }

  @Post(':id/registrar-gasto')
  @Roles(UserRole.ADMINISTRADOR, UserRole.VENDEDOR)
  @ApiOperation({ 
    summary: 'Registrar gasto en caja',
    description: 'Registra un gasto en el cierre de caja activo'
  })
  @ApiParam({ name: 'id', description: 'ID del cierre de caja' })
  @ApiResponse({ 
    status: 200, 
    description: 'Gasto registrado exitosamente'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'No se pueden registrar gastos en una caja cerrada'
  })
  registrarGasto(
    @Param('id') id: string,
    @Body() body: {
      gastoId: string;
      descripcion: string;
      monto: number;
      categoria: string;
    },
  ) {
    return this.cierresCajaService.registrarGasto(
      id,
      body.gastoId,
      body.descripcion,
      body.monto,
      body.categoria,
    );
  }

  @Delete(':id')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Eliminar cierre',
    description: 'Elimina (desactiva) un cierre de caja (solo administradores)'
  })
  @ApiParam({ name: 'id', description: 'ID del cierre' })
  @ApiResponse({ 
    status: 200, 
    description: 'Cierre eliminado exitosamente'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'No se puede eliminar una caja abierta'
  })
  remove(@Param('id') id: string) {
    return this.cierresCajaService.remove(id);
  }
}

