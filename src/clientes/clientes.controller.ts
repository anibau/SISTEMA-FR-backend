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
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../usuarios/entities/usuario.entity';
import { Cliente } from './entities/cliente.entity';

@ApiTags('clientes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Post()
  @Roles(Role.ADMINISTRADOR, Role.VENDEDOR)
  @ApiOperation({ summary: 'Crear un nuevo cliente' })
  @ApiResponse({
    status: 201,
    description: 'Cliente creado exitosamente',
    type: Cliente,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'Cliente ya existe' })
  create(@Body() createClienteDto: CreateClienteDto) {
    return this.clientesService.create(createClienteDto);
  }

  @Get()
  @Roles(Role.ADMINISTRADOR, Role.VENDEDOR)
  @ApiOperation({ summary: 'Obtener todos los clientes con paginación y búsqueda' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Elementos por página' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Buscar por nombre, documento o teléfono' })
  @ApiResponse({
    status: 200,
    description: 'Lista de clientes obtenida exitosamente',
  })
  findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('search') search?: string,
  ) {
    return this.clientesService.findAll(page, limit, search);
  }

  @Get('ranking/puntos')
  @Roles(Role.ADMINISTRADOR, Role.VENDEDOR)
  @ApiOperation({ summary: 'Obtener ranking de clientes por puntos' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Límite de resultados' })
  @ApiResponse({
    status: 200,
    description: 'Ranking de clientes por puntos',
  })
  getRankingPorPuntos(
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ) {
    return this.clientesService.getRankingPorPuntos(limit);
  }

  @Get('ranking/compras')
  @Roles(Role.ADMINISTRADOR, Role.VENDEDOR)
  @ApiOperation({ summary: 'Obtener ranking de clientes por compras' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Límite de resultados' })
  @ApiResponse({
    status: 200,
    description: 'Ranking de clientes por compras',
  })
  getRankingPorCompras(
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ) {
    return this.clientesService.getRankingPorCompras(limit);
  }

  @Get('cumpleanos')
  @Roles(Role.ADMINISTRADOR, Role.VENDEDOR)
  @ApiOperation({ summary: 'Obtener clientes que cumplen años hoy' })
  @ApiResponse({
    status: 200,
    description: 'Lista de clientes con cumpleaños hoy',
  })
  getClientesConCumpleanos() {
    return this.clientesService.getClientesConCumpleanos();
  }

  @Get('fiados-vencidos')
  @Roles(Role.ADMINISTRADOR, Role.VENDEDOR)
  @ApiOperation({ summary: 'Obtener clientes con fiados pendientes' })
  @ApiResponse({
    status: 200,
    description: 'Lista de clientes con fiados pendientes',
  })
  getClientesConFiadosVencidos() {
    return this.clientesService.getClientesConFiadosVencidos();
  }

  @Get('estadisticas')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Obtener estadísticas generales de clientes' })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas de clientes',
  })
  getEstadisticas() {
    return this.clientesService.getEstadisticas();
  }

  @Get('documento/:documento')
  @Roles(Role.ADMINISTRADOR, Role.VENDEDOR)
  @ApiOperation({ summary: 'Buscar cliente por documento' })
  @ApiResponse({
    status: 200,
    description: 'Cliente encontrado',
    type: Cliente,
  })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  findByDocumento(@Param('documento') documento: string) {
    return this.clientesService.findByDocumento(documento);
  }

  @Get('telefono/:telefono')
  @Roles(Role.ADMINISTRADOR, Role.VENDEDOR)
  @ApiOperation({ summary: 'Buscar cliente por teléfono' })
  @ApiResponse({
    status: 200,
    description: 'Cliente encontrado',
    type: Cliente,
  })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  findByTelefono(@Param('telefono') telefono: string) {
    return this.clientesService.findByTelefono(telefono);
  }

  @Get(':id')
  @Roles(Role.ADMINISTRADOR, Role.VENDEDOR)
  @ApiOperation({ summary: 'Obtener un cliente por ID' })
  @ApiResponse({
    status: 200,
    description: 'Cliente encontrado',
    type: Cliente,
  })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.clientesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMINISTRADOR, Role.VENDEDOR)
  @ApiOperation({ summary: 'Actualizar un cliente' })
  @ApiResponse({
    status: 200,
    description: 'Cliente actualizado exitosamente',
    type: Cliente,
  })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateClienteDto: UpdateClienteDto,
  ) {
    return this.clientesService.update(id, updateClienteDto);
  }

  @Patch(':id/puntos/agregar')
  @Roles(Role.ADMINISTRADOR, Role.VENDEDOR)
  @ApiOperation({ summary: 'Agregar puntos a un cliente' })
  @ApiResponse({
    status: 200,
    description: 'Puntos agregados exitosamente',
    type: Cliente,
  })
  agregarPuntos(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { puntos: number },
  ) {
    return this.clientesService.agregarPuntos(id, body.puntos);
  }

  @Patch(':id/puntos/canjear')
  @Roles(Role.ADMINISTRADOR, Role.VENDEDOR)
  @ApiOperation({ summary: 'Canjear puntos de un cliente' })
  @ApiResponse({
    status: 200,
    description: 'Puntos canjeados exitosamente',
    type: Cliente,
  })
  @ApiResponse({ status: 409, description: 'Puntos insuficientes' })
  canjearPuntos(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { puntos: number },
  ) {
    return this.clientesService.canjearPuntos(id, body.puntos);
  }

  @Patch(':id/fiado/agregar')
  @Roles(Role.ADMINISTRADOR, Role.VENDEDOR)
  @ApiOperation({ summary: 'Agregar monto al fiado de un cliente' })
  @ApiResponse({
    status: 200,
    description: 'Fiado actualizado exitosamente',
    type: Cliente,
  })
  actualizarSaldoFiado(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { monto: number },
  ) {
    return this.clientesService.actualizarSaldoFiado(id, body.monto);
  }

  @Patch(':id/fiado/pagar')
  @Roles(Role.ADMINISTRADOR, Role.VENDEDOR)
  @ApiOperation({ summary: 'Pagar fiado de un cliente' })
  @ApiResponse({
    status: 200,
    description: 'Pago de fiado registrado exitosamente',
    type: Cliente,
  })
  @ApiResponse({ status: 409, description: 'Monto mayor al saldo pendiente' })
  pagarFiado(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { monto: number },
  ) {
    return this.clientesService.pagarFiado(id, body.monto);
  }

  @Patch(':id/verificar-whatsapp')
  @Roles(Role.ADMINISTRADOR, Role.VENDEDOR)
  @ApiOperation({ summary: 'Verificar WhatsApp de un cliente' })
  @ApiResponse({
    status: 200,
    description: 'Cliente verificado por WhatsApp',
    type: Cliente,
  })
  verificarWhatsapp(@Param('id', ParseUUIDPipe) id: string) {
    return this.clientesService.verificarWhatsapp(id);
  }

  @Patch(':id/marcar-vip')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Marcar cliente como VIP' })
  @ApiResponse({
    status: 200,
    description: 'Cliente marcado como VIP',
    type: Cliente,
  })
  marcarComoVip(@Param('id', ParseUUIDPipe) id: string) {
    return this.clientesService.marcarComoVip(id);
  }

  @Delete(':id')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Eliminar un cliente (soft delete)' })
  @ApiResponse({
    status: 200,
    description: 'Cliente eliminado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.clientesService.remove(id);
  }
}

