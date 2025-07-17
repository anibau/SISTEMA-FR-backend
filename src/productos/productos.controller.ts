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
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { SearchProductoDto } from './dto/search-producto.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, UserRole } from '../common/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Productos')
@Controller('productos')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Post()
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Crear producto',
    description: 'Crea un nuevo producto en el inventario (solo administradores)'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Producto creado exitosamente'
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Ya existe un producto con este código'
  })
  create(@Body() createProductoDto: CreateProductoDto) {
    return this.productosService.create(createProductoDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Listar productos',
    description: 'Obtiene una lista paginada y filtrada de productos'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de productos obtenida exitosamente'
  })
  findAll(@Query() searchDto: SearchProductoDto) {
    return this.productosService.findAll(searchDto);
  }

  @Get('destacados')
  @Public()
  @ApiOperation({ 
    summary: 'Productos destacados',
    description: 'Obtiene los productos marcados como destacados (público)'
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Límite de productos' })
  @ApiResponse({ 
    status: 200, 
    description: 'Productos destacados obtenidos exitosamente'
  })
  getDestacados(@Query('limit') limit?: number) {
    return this.productosService.getProductosDestacados(limit);
  }

  @Get('stock-bajo')
  @Roles(UserRole.ADMINISTRADOR, UserRole.VENDEDOR)
  @ApiOperation({ 
    summary: 'Productos con stock bajo',
    description: 'Obtiene productos con stock menor o igual al mínimo'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Productos con stock bajo obtenidos exitosamente'
  })
  getStockBajo() {
    return this.productosService.getProductosStockBajo();
  }

  @Get('categorias')
  @ApiOperation({ 
    summary: 'Listar categorías',
    description: 'Obtiene todas las categorías de productos disponibles'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Categorías obtenidas exitosamente'
  })
  getCategorias() {
    return this.productosService.getCategorias();
  }

  @Get('marcas')
  @ApiOperation({ 
    summary: 'Listar marcas',
    description: 'Obtiene todas las marcas de productos disponibles'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Marcas obtenidas exitosamente'
  })
  getMarcas() {
    return this.productosService.getMarcas();
  }

  @Get('proveedores')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Listar proveedores',
    description: 'Obtiene todos los proveedores de productos (solo administradores)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Proveedores obtenidos exitosamente'
  })
  getProveedores() {
    return this.productosService.getProveedores();
  }

  @Get('estadisticas')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Estadísticas de productos',
    description: 'Obtiene estadísticas generales del inventario (solo administradores)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estadísticas obtenidas exitosamente',
    schema: {
      type: 'object',
      properties: {
        totalProductos: { type: 'number', example: 150 },
        productosVisibles: { type: 'number', example: 140 },
        productosDestacados: { type: 'number', example: 20 },
        productosStockBajo: { type: 'number', example: 5 },
        valorInventario: { type: 'number', example: 25000.50 },
        totalCategorias: { type: 'number', example: 8 },
        totalMarcas: { type: 'number', example: 25 },
      }
    }
  })
  getEstadisticas() {
    return this.productosService.getEstadisticas();
  }

  @Get('buscar/:termino')
  @ApiOperation({ 
    summary: 'Buscar productos',
    description: 'Busca productos por código o nombre (para POS)'
  })
  @ApiParam({ name: 'termino', description: 'Término de búsqueda' })
  @ApiResponse({ 
    status: 200, 
    description: 'Resultados de búsqueda obtenidos exitosamente'
  })
  buscarProductos(@Param('termino') termino: string) {
    return this.productosService.buscarPorCodigoONombre(termino);
  }

  @Get('codigo/:codigo')
  @ApiOperation({ 
    summary: 'Obtener producto por código',
    description: 'Obtiene un producto específico por su código'
  })
  @ApiParam({ name: 'codigo', description: 'Código del producto' })
  @ApiResponse({ 
    status: 200, 
    description: 'Producto encontrado'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Producto no encontrado'
  })
  findByCodigo(@Param('codigo') codigo: string) {
    return this.productosService.findByCodigo(codigo);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Obtener producto por ID',
    description: 'Obtiene un producto específico por su ID'
  })
  @ApiParam({ name: 'id', description: 'ID del producto' })
  @ApiResponse({ 
    status: 200, 
    description: 'Producto encontrado'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Producto no encontrado'
  })
  findOne(@Param('id') id: string) {
    return this.productosService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Actualizar producto',
    description: 'Actualiza un producto específico (solo administradores)'
  })
  @ApiParam({ name: 'id', description: 'ID del producto' })
  @ApiResponse({ 
    status: 200, 
    description: 'Producto actualizado exitosamente'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Producto no encontrado'
  })
  update(@Param('id') id: string, @Body() updateProductoDto: UpdateProductoDto) {
    return this.productosService.update(id, updateProductoDto);
  }

  @Patch(':id/stock')
  @Roles(UserRole.ADMINISTRADOR, UserRole.VENDEDOR)
  @ApiOperation({ 
    summary: 'Actualizar stock',
    description: 'Actualiza el stock de un producto específico'
  })
  @ApiParam({ name: 'id', description: 'ID del producto' })
  @ApiResponse({ 
    status: 200, 
    description: 'Stock actualizado exitosamente'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Stock insuficiente'
  })
  updateStock(
    @Param('id') id: string,
    @Body() body: { cantidad: number; motivo?: string }
  ) {
    return this.productosService.updateStock(id, body.cantidad, body.motivo);
  }

  @Post('precios/actualizar-masivo')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Actualización masiva de precios',
    description: 'Actualiza precios de productos en lote (solo administradores)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Precios actualizados exitosamente',
    schema: {
      type: 'object',
      properties: {
        actualizados: { type: 'number', example: 25 }
      }
    }
  })
  actualizarPreciosMasivo(
    @Body() body: {
      filtros: { categoria?: string; marca?: string; proveedor?: string };
      porcentajeAumento: number;
    }
  ) {
    return this.productosService.actualizarPrecioMasivo(
      body.filtros,
      body.porcentajeAumento
    );
  }

  @Delete(':id')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Eliminar producto',
    description: 'Elimina (desactiva) un producto específico (solo administradores)'
  })
  @ApiParam({ name: 'id', description: 'ID del producto' })
  @ApiResponse({ 
    status: 200, 
    description: 'Producto eliminado exitosamente'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Producto no encontrado'
  })
  remove(@Param('id') id: string) {
    return this.productosService.remove(id);
  }
}

