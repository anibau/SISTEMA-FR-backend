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
import { PromocionesService } from './promociones.service';
import { CreatePromocionDto } from './dto/create-promocion.dto';
import { UpdatePromocionDto } from './dto/update-promocion.dto';
import { AplicarPromocionDto, ValidarPromocionDto } from './dto/aplicar-promocion.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, UserRole } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { TipoPromocion } from './entities/promocion.entity';

@ApiTags('Promociones')
@Controller('promociones')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class PromocionesController {
  constructor(private readonly promocionesService: PromocionesService) {}

  @Post()
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Crear promoción',
    description: 'Crea una nueva promoción en el sistema (solo administradores)'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Promoción creada exitosamente'
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Ya existe una promoción con este código'
  })
  create(
    @Body() createPromocionDto: CreatePromocionDto,
    @CurrentUser() user: any,
  ) {
    return this.promocionesService.create(createPromocionDto, user.id);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Listar promociones',
    description: 'Obtiene una lista paginada de promociones'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de promociones obtenida exitosamente'
  })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.promocionesService.findAll(paginationDto);
  }

  @Get('activas')
  @Public()
  @ApiOperation({ 
    summary: 'Promociones activas',
    description: 'Obtiene todas las promociones activas y vigentes (público)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Promociones activas obtenidas exitosamente'
  })
  findActivas() {
    return this.promocionesService.findActivas();
  }

  @Get('tipo/:tipo')
  @ApiOperation({ 
    summary: 'Promociones por tipo',
    description: 'Obtiene promociones filtradas por tipo'
  })
  @ApiParam({ 
    name: 'tipo', 
    enum: TipoPromocion,
    description: 'Tipo de promoción' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Promociones por tipo obtenidas exitosamente'
  })
  findByTipo(@Param('tipo') tipo: TipoPromocion) {
    return this.promocionesService.findByTipo(tipo);
  }

  @Get('estadisticas')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Estadísticas de promociones',
    description: 'Obtiene estadísticas generales del sistema de promociones (solo administradores)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estadísticas obtenidas exitosamente',
    schema: {
      type: 'object',
      properties: {
        totalPromociones: { type: 'number', example: 25 },
        promocionesActivas: { type: 'number', example: 15 },
        promocionesVencidas: { type: 'number', example: 5 },
        totalDescuentoOtorgado: { type: 'number', example: 1250.75 },
        promocionMasUsada: {
          type: 'object',
          properties: {
            nombre: { type: 'string', example: 'Descuento Cumpleaños' },
            codigo: { type: 'string', example: 'CUMPLE2024' },
            totalUsos: { type: 'number', example: 45 },
            totalDescuento: { type: 'number', example: 450.25 },
          }
        },
        usosHoy: { type: 'number', example: 8 },
      }
    }
  })
  getEstadisticas() {
    return this.promocionesService.getEstadisticas();
  }

  @Post('validar')
  @ApiOperation({ 
    summary: 'Validar promoción',
    description: 'Valida si una promoción puede ser aplicada'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Validación realizada exitosamente',
    schema: {
      type: 'object',
      properties: {
        valida: { type: 'boolean', example: true },
        descuento: { type: 'number', example: 15.50 },
        mensaje: { type: 'string', example: 'Promoción válida' },
      }
    }
  })
  validarPromocion(@Body() validarDto: ValidarPromocionDto) {
    return this.promocionesService.validarPromocion(validarDto);
  }

  @Post('aplicar')
  @ApiOperation({ 
    summary: 'Aplicar promoción',
    description: 'Aplica una promoción a un carrito de compras'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Promoción aplicada exitosamente',
    schema: {
      type: 'object',
      properties: {
        aplicada: { type: 'boolean', example: true },
        descuentoTotal: { type: 'number', example: 25.75 },
        detalles: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              productoId: { type: 'string', example: 'uuid-producto-1' },
              cantidad: { type: 'number', example: 2 },
              precio: { type: 'number', example: 15.50 },
              subtotal: { type: 'number', example: 31.00 },
              descuento: { type: 'number', example: 3.10 },
            }
          }
        },
        mensaje: { type: 'string', example: 'Promoción aplicada exitosamente' },
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Error al aplicar la promoción'
  })
  aplicarPromocion(@Body() aplicarDto: AplicarPromocionDto) {
    return this.promocionesService.aplicarPromocion(aplicarDto);
  }

  @Get('codigo/:codigo')
  @ApiOperation({ 
    summary: 'Obtener promoción por código',
    description: 'Obtiene una promoción específica por su código'
  })
  @ApiParam({ name: 'codigo', description: 'Código de la promoción' })
  @ApiResponse({ 
    status: 200, 
    description: 'Promoción encontrada'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Promoción no encontrada'
  })
  findByCodigo(@Param('codigo') codigo: string) {
    return this.promocionesService.findByCodigo(codigo);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Obtener promoción por ID',
    description: 'Obtiene una promoción específica por su ID'
  })
  @ApiParam({ name: 'id', description: 'ID de la promoción' })
  @ApiResponse({ 
    status: 200, 
    description: 'Promoción encontrada'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Promoción no encontrada'
  })
  findOne(@Param('id') id: string) {
    return this.promocionesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Actualizar promoción',
    description: 'Actualiza una promoción específica (solo administradores)'
  })
  @ApiParam({ name: 'id', description: 'ID de la promoción' })
  @ApiResponse({ 
    status: 200, 
    description: 'Promoción actualizada exitosamente'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Promoción no encontrada'
  })
  update(@Param('id') id: string, @Body() updatePromocionDto: UpdatePromocionDto) {
    return this.promocionesService.update(id, updatePromocionDto);
  }

  @Patch(':id/activar')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Activar promoción',
    description: 'Activa una promoción específica (solo administradores)'
  })
  @ApiParam({ name: 'id', description: 'ID de la promoción' })
  @ApiResponse({ 
    status: 200, 
    description: 'Promoción activada exitosamente'
  })
  activar(@Param('id') id: string) {
    return this.promocionesService.activar(id);
  }

  @Patch(':id/desactivar')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Desactivar promoción',
    description: 'Desactiva una promoción específica (solo administradores)'
  })
  @ApiParam({ name: 'id', description: 'ID de la promoción' })
  @ApiResponse({ 
    status: 200, 
    description: 'Promoción desactivada exitosamente'
  })
  desactivar(@Param('id') id: string) {
    return this.promocionesService.desactivar(id);
  }

  @Patch(':id/pausar')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Pausar promoción',
    description: 'Pausa una promoción específica (solo administradores)'
  })
  @ApiParam({ name: 'id', description: 'ID de la promoción' })
  @ApiResponse({ 
    status: 200, 
    description: 'Promoción pausada exitosamente'
  })
  pausar(@Param('id') id: string) {
    return this.promocionesService.pausar(id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Eliminar promoción',
    description: 'Elimina (desactiva) una promoción específica (solo administradores)'
  })
  @ApiParam({ name: 'id', description: 'ID de la promoción' })
  @ApiResponse({ 
    status: 200, 
    description: 'Promoción eliminada exitosamente'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Promoción no encontrada'
  })
  remove(@Param('id') id: string) {
    return this.promocionesService.remove(id);
  }
}

