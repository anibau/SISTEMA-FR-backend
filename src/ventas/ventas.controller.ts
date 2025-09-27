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
  ParseUUIDPipe,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { VentasService } from './ventas.service';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../usuarios/entities/usuario.entity';
import { Venta, EstadoVenta, MetodoPago } from './entities/venta.entity';

@ApiTags('ventas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ventas')
export class VentasController {
  constructor(private readonly ventasService: VentasService) {}

  @Post()
  @Roles(Role.ADMINISTRADOR, Role.VENDEDOR)
  @ApiOperation({ summary: 'Crear una nueva venta' })
  @ApiResponse({
    status: 201,
    description: 'Venta creada exitosamente',
    type: Venta,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Producto o cliente no encontrado' })
  create(@Body() createVentaDto: CreateVentaDto) {
    return this.ventasService.create(createVentaDto);
  }

  @Get()
  @Roles(Role.ADMINISTRADOR, Role.VENDEDOR)
  @ApiOperation({ summary: 'Obtener todas las ventas con paginación y filtros' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Elementos por página' })
  @ApiQuery({ name: 'estado', required: false, enum: EstadoVenta, description: 'Filtrar por estado' })
  @ApiQuery({ name: 'metodoPago', required: false, enum: MetodoPago, description: 'Filtrar por método de pago' })
  @ApiQuery({ name: 'fechaInicio', required: false, type: String, description: 'Fecha inicio (YYYY-MM-DD)' })
  @ApiQuery({ name: 'fechaFin', required: false, type: String, description: 'Fecha fin (YYYY-MM-DD)' })
  @ApiQuery({ name: 'clienteId', required: false, type: String, description: 'ID del cliente' })
  @ApiQuery({ name: 'usuarioId', required: false, type: String, description: 'ID del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Lista de ventas obtenida exitosamente',
  })
  findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('estado') estado?: EstadoVenta,
    @Query('metodoPago') metodoPago?: MetodoPago,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
    @Query('clienteId') clienteId?: string,
    @Query('usuarioId') usuarioId?: string,
  ) {
    const filters = {
      estado,
      metodoPago,
      fechaInicio: fechaInicio ? new Date(fechaInicio) : undefined,
      fechaFin: fechaFin ? new Date(fechaFin) : undefined,
      clienteId,
      usuarioId,
    };

    return this.ventasService.findAll(page, limit, filters);
  }

  @Get('reportes/periodo')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Obtener reporte de ventas por período' })
  @ApiQuery({ name: 'fechaInicio', required: true, type: String, description: 'Fecha inicio (YYYY-MM-DD)' })
  @ApiQuery({ name: 'fechaFin', required: true, type: String, description: 'Fecha fin (YYYY-MM-DD)' })
  @ApiResponse({
    status: 200,
    description: 'Reporte de ventas por período',
  })
  getVentasPorPeriodo(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
  ) {
    return this.ventasService.getVentasPorPeriodo(
      new Date(fechaInicio),
      new Date(fechaFin)
    );
  }

  @Get('reportes/productos-mas-vendidos')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Obtener productos más vendidos' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Límite de resultados' })
  @ApiResponse({
    status: 200,
    description: 'Lista de productos más vendidos',
  })
  getProductosMasVendidos(
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ) {
    return this.ventasService.getProductosMasVendidos(limit);
  }

  @Get('tickets/activos/:usuarioId')
  @Roles(Role.ADMINISTRADOR, Role.VENDEDOR)
  @ApiOperation({ summary: 'Obtener tickets activos de un usuario' })
  @ApiResponse({
    status: 200,
    description: 'Lista de tickets activos',
  })
  getTicketsActivos(@Param('usuarioId', ParseUUIDPipe) usuarioId: string) {
    return this.ventasService.getTicketsActivos(usuarioId);
  }

  @Post('tickets/crear')
  @Roles(Role.ADMINISTRADOR, Role.VENDEDOR)
  @ApiOperation({ summary: 'Crear un nuevo ticket para multiticket' })
  @ApiResponse({
    status: 201,
    description: 'Ticket creado exitosamente',
  })
  crearTicket(
    @Body() body: { usuarioId: string; ticketId: string }
  ) {
    return this.ventasService.crearTicket(body.usuarioId, body.ticketId);
  }

  @Get(':id')
  @Roles(Role.ADMINISTRADOR, Role.VENDEDOR)
  @ApiOperation({ summary: 'Obtener una venta por ID' })
  @ApiResponse({
    status: 200,
    description: 'Venta encontrada',
    type: Venta,
  })
  @ApiResponse({ status: 404, description: 'Venta no encontrada' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ventasService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMINISTRADOR, Role.VENDEDOR)
  @ApiOperation({ summary: 'Actualizar una venta' })
  @ApiResponse({
    status: 200,
    description: 'Venta actualizada exitosamente',
    type: Venta,
  })
  @ApiResponse({ status: 404, description: 'Venta no encontrada' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateVentaDto: UpdateVentaDto,
  ) {
    return this.ventasService.update(id, updateVentaDto);
  }

  @Delete(':id')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Eliminar una venta (soft delete)' })
  @ApiResponse({
    status: 200,
    description: 'Venta eliminada exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Venta no encontrada' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.ventasService.remove(id);
  }
}

