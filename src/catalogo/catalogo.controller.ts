import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CatalogoService, FiltrosCatalogo } from './catalogo.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Catálogo Público')
@Controller('catalogo')
@Public() // Todo el catálogo es público
export class CatalogoController {
  constructor(private readonly catalogoService: CatalogoService) {}

  @Get('productos')
  @ApiOperation({ 
    summary: 'Listar productos del catálogo',
    description: 'Obtiene productos disponibles con filtros opcionales (público)'
  })
  @ApiQuery({ name: 'categoria', required: false, description: 'Filtrar por categoría' })
  @ApiQuery({ name: 'marca', required: false, description: 'Filtrar por marca' })
  @ApiQuery({ name: 'precioMin', required: false, description: 'Precio mínimo' })
  @ApiQuery({ name: 'precioMax', required: false, description: 'Precio máximo' })
  @ApiQuery({ name: 'busqueda', required: false, description: 'Término de búsqueda' })
  @ApiQuery({ name: 'destacados', required: false, description: 'Solo productos destacados' })
  @ApiQuery({ name: 'disponibles', required: false, description: 'Solo productos disponibles (default: true)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Límite de resultados (default: 20)' })
  @ApiQuery({ name: 'offset', required: false, description: 'Offset para paginación (default: 0)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Productos del catálogo obtenidos exitosamente',
    schema: {
      type: 'object',
      properties: {
        productos: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'uuid-producto-1' },
              nombre: { type: 'string', example: 'Cerveza Corona 355ml' },
              descripcion: { type: 'string', example: 'Cerveza premium importada' },
              precio: { type: 'number', example: 8.50 },
              precioOferta: { type: 'number', example: 7.50 },
              categoria: { type: 'string', example: 'Cervezas' },
              marca: { type: 'string', example: 'Corona' },
              imagen: { type: 'string', example: 'https://example.com/corona.jpg' },
              disponible: { type: 'boolean', example: true },
              stock: { type: 'number', example: 25 },
              destacado: { type: 'boolean', example: true },
              descuento: { type: 'number', example: 12 },
              etiquetas: { type: 'array', items: { type: 'string' }, example: ['Destacado', 'Oferta'] },
            }
          }
        },
        total: { type: 'number', example: 150 },
        pagina: { type: 'number', example: 1 },
        totalPaginas: { type: 'number', example: 8 },
      }
    }
  })
  obtenerProductos(@Query() filtros: FiltrosCatalogo) {
    return this.catalogoService.obtenerProductos(filtros);
  }

  @Get('combos')
  @ApiOperation({ 
    summary: 'Listar combos del catálogo',
    description: 'Obtiene combos disponibles con filtros opcionales (público)'
  })
  @ApiQuery({ name: 'destacados', required: false, description: 'Solo combos destacados' })
  @ApiQuery({ name: 'disponibles', required: false, description: 'Solo combos disponibles (default: true)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Límite de resultados (default: 20)' })
  @ApiQuery({ name: 'offset', required: false, description: 'Offset para paginación (default: 0)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Combos del catálogo obtenidos exitosamente',
    schema: {
      type: 'object',
      properties: {
        combos: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'uuid-combo-1' },
              nombre: { type: 'string', example: 'Pack Cerveza + Piqueo' },
              descripcion: { type: 'string', example: 'Combo perfecto para compartir' },
              precio: { type: 'number', example: 25.00 },
              precioOriginal: { type: 'number', example: 30.00 },
              descuento: { type: 'number', example: 16.67 },
              imagen: { type: 'string', example: 'https://example.com/combo.jpg' },
              disponible: { type: 'boolean', example: true },
              productos: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', example: 'uuid-producto-1' },
                    nombre: { type: 'string', example: 'Cerveza Corona' },
                    cantidad: { type: 'number', example: 2 },
                    precio: { type: 'number', example: 8.50 },
                  }
                }
              },
              destacado: { type: 'boolean', example: true },
            }
          }
        },
        total: { type: 'number', example: 25 },
        pagina: { type: 'number', example: 1 },
        totalPaginas: { type: 'number', example: 2 },
      }
    }
  })
  obtenerCombos(@Query() filtros: any) {
    return this.catalogoService.obtenerCombos(filtros);
  }

  @Get('producto/:id')
  @ApiOperation({ 
    summary: 'Detalle de producto',
    description: 'Obtiene el detalle completo de un producto específico (público)'
  })
  @ApiParam({ name: 'id', description: 'ID del producto' })
  @ApiResponse({ 
    status: 200, 
    description: 'Detalle del producto obtenido exitosamente'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Producto no encontrado'
  })
  obtenerProductoDetalle(@Param('id') id: string) {
    return this.catalogoService.obtenerProductoDetalle(id);
  }

  @Get('combo/:id')
  @ApiOperation({ 
    summary: 'Detalle de combo',
    description: 'Obtiene el detalle completo de un combo específico (público)'
  })
  @ApiParam({ name: 'id', description: 'ID del combo' })
  @ApiResponse({ 
    status: 200, 
    description: 'Detalle del combo obtenido exitosamente'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Combo no encontrado'
  })
  obtenerComboDetalle(@Param('id') id: string) {
    return this.catalogoService.obtenerComboDetalle(id);
  }

  @Get('categorias')
  @ApiOperation({ 
    summary: 'Listar categorías',
    description: 'Obtiene todas las categorías disponibles con contadores (público)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Categorías obtenidas exitosamente',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          categoria: { type: 'string', example: 'Cervezas' },
          totalProductos: { type: 'number', example: 45 },
          productosDisponibles: { type: 'number', example: 38 },
        }
      }
    }
  })
  obtenerCategorias() {
    return this.catalogoService.obtenerCategorias();
  }

  @Get('marcas')
  @ApiOperation({ 
    summary: 'Listar marcas',
    description: 'Obtiene todas las marcas disponibles con contadores (público)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Marcas obtenidas exitosamente',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          marca: { type: 'string', example: 'Corona' },
          totalProductos: { type: 'number', example: 8 },
          productosDisponibles: { type: 'number', example: 6 },
        }
      }
    }
  })
  obtenerMarcas() {
    return this.catalogoService.obtenerMarcas();
  }

  @Get('destacados')
  @ApiOperation({ 
    summary: 'Productos y combos destacados',
    description: 'Obtiene una selección de productos y combos destacados (público)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Destacados obtenidos exitosamente',
    schema: {
      type: 'object',
      properties: {
        productos: {
          type: 'array',
          items: { type: 'object' }
        },
        combos: {
          type: 'array',
          items: { type: 'object' }
        }
      }
    }
  })
  obtenerDestacados() {
    return this.catalogoService.obtenerDestacados();
  }

  @Get('novedades')
  @ApiOperation({ 
    summary: 'Productos nuevos',
    description: 'Obtiene los productos más recientes agregados al catálogo (público)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Novedades obtenidas exitosamente',
    schema: {
      type: 'array',
      items: { type: 'object' }
    }
  })
  obtenerNovedades() {
    return this.catalogoService.obtenerNovedades();
  }

  @Get('ofertas')
  @ApiOperation({ 
    summary: 'Productos en oferta',
    description: 'Obtiene todos los productos que tienen precio de oferta (público)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Ofertas obtenidas exitosamente',
    schema: {
      type: 'array',
      items: { type: 'object' }
    }
  })
  obtenerOfertas() {
    return this.catalogoService.obtenerOfertas();
  }

  @Get('buscar')
  @ApiOperation({ 
    summary: 'Buscar en el catálogo',
    description: 'Busca productos y combos por término de búsqueda (público)'
  })
  @ApiQuery({ name: 'q', description: 'Término de búsqueda' })
  @ApiQuery({ name: 'limit', required: false, description: 'Límite de resultados (default: 20)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Resultados de búsqueda obtenidos exitosamente',
    schema: {
      type: 'object',
      properties: {
        productos: {
          type: 'array',
          items: { type: 'object' }
        },
        combos: {
          type: 'array',
          items: { type: 'object' }
        },
        total: { type: 'number', example: 15 }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Término de búsqueda requerido'
  })
  buscar(@Query('q') termino: string, @Query('limit') limit?: number) {
    if (!termino) {
      throw new Error('Término de búsqueda requerido');
    }
    return this.catalogoService.buscar(termino, limit);
  }
}

