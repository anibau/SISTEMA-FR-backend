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
import { CombosService } from './combos.service';
import { CreateComboDto } from './dto/create-combo.dto';
import { UpdateComboDto } from './dto/update-combo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../usuarios/entities/usuario.entity';
import { Combo } from './entities/combo.entity';

@ApiTags('combos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('combos')
export class CombosController {
  constructor(private readonly combosService: CombosService) {}

  @Post()
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Crear un nuevo combo' })
  @ApiResponse({
    status: 201,
    description: 'Combo creado exitosamente',
    type: Combo,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'Combo ya existe' })
  create(@Body() createComboDto: CreateComboDto) {
    return this.combosService.create(createComboDto);
  }

  @Get()
  @Roles(Role.ADMINISTRADOR, Role.VENDEDOR)
  @ApiOperation({ summary: 'Obtener todos los combos con paginación y filtros' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Elementos por página' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Buscar por nombre o código' })
  @ApiQuery({ name: 'esVisible', required: false, type: Boolean, description: 'Filtrar por visibilidad' })
  @ApiQuery({ name: 'esDestacado', required: false, type: Boolean, description: 'Filtrar por destacados' })
  @ApiResponse({
    status: 200,
    description: 'Lista de combos obtenida exitosamente',
  })
  findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('search') search?: string,
    @Query('esVisible') esVisible?: boolean,
    @Query('esDestacado') esDestacado?: boolean,
  ) {
    const filters = { search, esVisible, esDestacado };
    return this.combosService.findAll(page, limit, filters);
  }

  @Get('disponibles')
  @Roles(Role.ADMINISTRADOR, Role.VENDEDOR)
  @ApiOperation({ summary: 'Obtener combos disponibles (visibles y en vigencia)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de combos disponibles',
  })
  getCombosDisponibles() {
    return this.combosService.getCombosDisponibles();
  }

  @Get('destacados')
  @Roles(Role.ADMINISTRADOR, Role.VENDEDOR)
  @ApiOperation({ summary: 'Obtener combos destacados' })
  @ApiResponse({
    status: 200,
    description: 'Lista de combos destacados',
  })
  getCombosDestacados() {
    return this.combosService.getCombosDestacados();
  }

  @Get('mas-vendidos')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Obtener combos más vendidos' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Límite de resultados' })
  @ApiResponse({
    status: 200,
    description: 'Lista de combos más vendidos',
  })
  getCombosMasVendidos(
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ) {
    return this.combosService.getCombosMasVendidos(limit);
  }

  @Get('estadisticas')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Obtener estadísticas generales de combos' })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas de combos',
  })
  getEstadisticas() {
    return this.combosService.getEstadisticas();
  }

  @Get('codigo/:codigo')
  @Roles(Role.ADMINISTRADOR, Role.VENDEDOR)
  @ApiOperation({ summary: 'Buscar combo por código' })
  @ApiResponse({
    status: 200,
    description: 'Combo encontrado',
    type: Combo,
  })
  @ApiResponse({ status: 404, description: 'Combo no encontrado' })
  findByCodigo(@Param('codigo') codigo: string) {
    return this.combosService.findByCodigo(codigo);
  }

  @Get(':id')
  @Roles(Role.ADMINISTRADOR, Role.VENDEDOR)
  @ApiOperation({ summary: 'Obtener un combo por ID' })
  @ApiResponse({
    status: 200,
    description: 'Combo encontrado',
    type: Combo,
  })
  @ApiResponse({ status: 404, description: 'Combo no encontrado' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.combosService.findOne(id);
  }

  @Get(':id/verificar-stock')
  @Roles(Role.ADMINISTRADOR, Role.VENDEDOR)
  @ApiOperation({ summary: 'Verificar disponibilidad de stock para un combo' })
  @ApiResponse({
    status: 200,
    description: 'Estado de disponibilidad del combo',
  })
  verificarDisponibilidadStock(@Param('id', ParseUUIDPipe) id: string) {
    return this.combosService.verificarDisponibilidadStock(id);
  }

  @Patch(':id')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Actualizar un combo' })
  @ApiResponse({
    status: 200,
    description: 'Combo actualizado exitosamente',
    type: Combo,
  })
  @ApiResponse({ status: 404, description: 'Combo no encontrado' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateComboDto: UpdateComboDto,
  ) {
    return this.combosService.update(id, updateComboDto);
  }

  @Patch(':id/recalcular-precio')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Recalcular precio original del combo basado en productos actuales' })
  @ApiResponse({
    status: 200,
    description: 'Precio recalculado exitosamente',
    type: Combo,
  })
  recalcularPrecioOriginal(@Param('id', ParseUUIDPipe) id: string) {
    return this.combosService.recalcularPrecioOriginal(id);
  }

  @Patch(':id/estadisticas')
  @Roles(Role.ADMINISTRADOR, Role.VENDEDOR)
  @ApiOperation({ summary: 'Actualizar estadísticas de venta del combo' })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas actualizadas exitosamente',
    type: Combo,
  })
  actualizarEstadisticas(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { cantidadVendida: number; ingresoGenerado: number },
  ) {
    return this.combosService.actualizarEstadisticas(
      id,
      body.cantidadVendida,
      body.ingresoGenerado,
    );
  }

  @Post(':id/duplicar')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Duplicar un combo existente' })
  @ApiResponse({
    status: 201,
    description: 'Combo duplicado exitosamente',
    type: Combo,
  })
  @ApiResponse({ status: 409, description: 'El código del nuevo combo ya existe' })
  duplicarCombo(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { nuevoCodigo: string; nuevoNombre: string },
  ) {
    return this.combosService.duplicarCombo(id, body.nuevoCodigo, body.nuevoNombre);
  }

  @Delete(':id')
  @Roles(Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Eliminar un combo (soft delete)' })
  @ApiResponse({
    status: 200,
    description: 'Combo eliminado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Combo no encontrado' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.combosService.remove(id);
  }
}

