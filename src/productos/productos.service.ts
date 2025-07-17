import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, MoreThan, LessThan } from 'typeorm';
import { Producto } from './entities/producto.entity';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { SearchProductoDto } from './dto/search-producto.dto';
import { PaginationResponseDto } from '../common/dto/pagination.dto';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private productoRepository: Repository<Producto>,
  ) {}

  async create(createProductoDto: CreateProductoDto): Promise<Producto> {
    // Verificar si el código ya existe
    const existingProduct = await this.productoRepository.findOne({
      where: { codigo: createProductoDto.codigo },
    });

    if (existingProduct) {
      throw new ConflictException('Ya existe un producto con este código');
    }

    const producto = this.productoRepository.create(createProductoDto);
    return this.productoRepository.save(producto);
  }

  async findAll(searchDto: SearchProductoDto): Promise<PaginationResponseDto<Producto>> {
    const {
      page = 1,
      limit = 10,
      search,
      categoria,
      marca,
      proveedor,
      esDestacado,
      esVisible,
      stockBajo,
      precioMin,
      precioMax,
      sortBy = 'nombre',
      sortOrder = 'ASC',
    } = searchDto;

    const skip = (page - 1) * limit;
    const queryBuilder = this.productoRepository.createQueryBuilder('producto');

    // Filtros básicos
    queryBuilder.where('producto.isActive = :isActive', { isActive: true });

    // Búsqueda por texto
    if (search) {
      queryBuilder.andWhere(
        '(producto.nombre ILIKE :search OR producto.codigo ILIKE :search OR producto.descripcion ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Filtros específicos
    if (categoria) {
      queryBuilder.andWhere('producto.categoria = :categoria', { categoria });
    }

    if (marca) {
      queryBuilder.andWhere('producto.marca = :marca', { marca });
    }

    if (proveedor) {
      queryBuilder.andWhere('producto.proveedor = :proveedor', { proveedor });
    }

    if (esDestacado !== undefined) {
      queryBuilder.andWhere('producto.esDestacado = :esDestacado', { esDestacado });
    }

    if (esVisible !== undefined) {
      queryBuilder.andWhere('producto.esVisible = :esVisible', { esVisible });
    }

    if (stockBajo) {
      queryBuilder.andWhere('producto.stock <= producto.stockMinimo');
    }

    // Filtros de precio
    if (precioMin !== undefined) {
      queryBuilder.andWhere('producto.precio >= :precioMin', { precioMin });
    }

    if (precioMax !== undefined) {
      queryBuilder.andWhere('producto.precio <= :precioMax', { precioMax });
    }

    // Ordenamiento
    queryBuilder.orderBy(`producto.${sortBy}`, sortOrder);

    // Paginación
    queryBuilder.skip(skip).take(limit);

    const [productos, total] = await queryBuilder.getManyAndCount();

    return new PaginationResponseDto(productos, total, page, limit);
  }

  async findOne(id: string): Promise<Producto> {
    const producto = await this.productoRepository.findOne({
      where: { id, isActive: true },
    });

    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }

    return producto;
  }

  async findByCodigo(codigo: string): Promise<Producto> {
    const producto = await this.productoRepository.findOne({
      where: { codigo, isActive: true },
    });

    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }

    return producto;
  }

  async update(id: string, updateProductoDto: UpdateProductoDto): Promise<Producto> {
    const producto = await this.findOne(id);

    // Registrar cambio de precio en historial
    if (updateProductoDto.precio && updateProductoDto.precio !== producto.precio) {
      const historialPrecios = producto.historialPrecios || [];
      historialPrecios.push({
        precio: producto.precio,
        fecha: new Date(),
        usuario: 'sistema', // Se puede obtener del contexto del usuario
        motivo: 'Actualización manual',
      });
      updateProductoDto.historialPrecios = historialPrecios;
    }

    await this.productoRepository.update(id, updateProductoDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const producto = await this.findOne(id);
    await this.productoRepository.update(id, { isActive: false });
  }

  async updateStock(id: string, cantidad: number, motivo?: string): Promise<Producto> {
    const producto = await this.findOne(id);
    
    if (producto.stock + cantidad < 0) {
      throw new BadRequestException('Stock insuficiente');
    }

    producto.actualizarStock(cantidad, motivo);
    await this.productoRepository.save(producto);
    
    return producto;
  }

  async getProductosDestacados(limit: number = 10): Promise<Producto[]> {
    return this.productoRepository.find({
      where: { 
        esDestacado: true, 
        esVisible: true, 
        isActive: true 
      },
      take: limit,
      order: { totalVendido: 'DESC' },
    });
  }

  async getProductosStockBajo(): Promise<Producto[]> {
    return this.productoRepository
      .createQueryBuilder('producto')
      .where('producto.stock <= producto.stockMinimo')
      .andWhere('producto.isActive = :isActive', { isActive: true })
      .orderBy('producto.stock', 'ASC')
      .getMany();
  }

  async getCategorias(): Promise<string[]> {
    const result = await this.productoRepository
      .createQueryBuilder('producto')
      .select('DISTINCT producto.categoria', 'categoria')
      .where('producto.categoria IS NOT NULL')
      .andWhere('producto.isActive = :isActive', { isActive: true })
      .getRawMany();

    return result.map(item => item.categoria).filter(Boolean);
  }

  async getMarcas(): Promise<string[]> {
    const result = await this.productoRepository
      .createQueryBuilder('producto')
      .select('DISTINCT producto.marca', 'marca')
      .where('producto.marca IS NOT NULL')
      .andWhere('producto.isActive = :isActive', { isActive: true })
      .getRawMany();

    return result.map(item => item.marca).filter(Boolean);
  }

  async getProveedores(): Promise<string[]> {
    const result = await this.productoRepository
      .createQueryBuilder('producto')
      .select('DISTINCT producto.proveedor', 'proveedor')
      .where('producto.proveedor IS NOT NULL')
      .andWhere('producto.isActive = :isActive', { isActive: true })
      .getRawMany();

    return result.map(item => item.proveedor).filter(Boolean);
  }

  async getEstadisticas(): Promise<any> {
    const totalProductos = await this.productoRepository.count({
      where: { isActive: true },
    });

    const productosVisibles = await this.productoRepository.count({
      where: { isActive: true, esVisible: true },
    });

    const productosDestacados = await this.productoRepository.count({
      where: { isActive: true, esDestacado: true },
    });

    const productosStockBajo = await this.productoRepository
      .createQueryBuilder('producto')
      .where('producto.stock <= producto.stockMinimo')
      .andWhere('producto.isActive = :isActive', { isActive: true })
      .getCount();

    const valorInventario = await this.productoRepository
      .createQueryBuilder('producto')
      .select('SUM(producto.precio * producto.stock)', 'total')
      .where('producto.isActive = :isActive', { isActive: true })
      .getRawOne();

    const categorias = await this.getCategorias();
    const marcas = await this.getMarcas();

    return {
      totalProductos,
      productosVisibles,
      productosDestacados,
      productosStockBajo,
      valorInventario: parseFloat(valorInventario.total) || 0,
      totalCategorias: categorias.length,
      totalMarcas: marcas.length,
    };
  }

  async buscarPorCodigoONombre(termino: string): Promise<Producto[]> {
    return this.productoRepository
      .createQueryBuilder('producto')
      .where('producto.isActive = :isActive', { isActive: true })
      .andWhere('producto.esVisible = :esVisible', { esVisible: true })
      .andWhere(
        '(producto.codigo ILIKE :termino OR producto.nombre ILIKE :termino)',
        { termino: `%${termino}%` }
      )
      .orderBy('producto.nombre', 'ASC')
      .limit(20)
      .getMany();
  }

  async actualizarPrecioMasivo(
    filtros: { categoria?: string; marca?: string; proveedor?: string },
    porcentajeAumento: number
  ): Promise<{ actualizados: number }> {
    const queryBuilder = this.productoRepository.createQueryBuilder('producto');
    
    queryBuilder.where('producto.isActive = :isActive', { isActive: true });

    if (filtros.categoria) {
      queryBuilder.andWhere('producto.categoria = :categoria', { categoria: filtros.categoria });
    }

    if (filtros.marca) {
      queryBuilder.andWhere('producto.marca = :marca', { marca: filtros.marca });
    }

    if (filtros.proveedor) {
      queryBuilder.andWhere('producto.proveedor = :proveedor', { proveedor: filtros.proveedor });
    }

    const productos = await queryBuilder.getMany();

    for (const producto of productos) {
      const nuevoPrecio = producto.precio * (1 + porcentajeAumento / 100);
      
      // Registrar en historial
      const historialPrecios = producto.historialPrecios || [];
      historialPrecios.push({
        precio: producto.precio,
        fecha: new Date(),
        usuario: 'sistema',
        motivo: `Actualización masiva ${porcentajeAumento}%`,
      });

      await this.productoRepository.update(producto.id, {
        precio: nuevoPrecio,
        historialPrecios,
      });
    }

    return { actualizados: productos.length };
  }
}

