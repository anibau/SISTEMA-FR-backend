import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { Producto } from '../productos/entities/producto.entity';
import { Combo } from '../combos/entities/combo.entity';

export interface FiltrosCatalogo {
  categoria?: string;
  marca?: string;
  precioMin?: number;
  precioMax?: number;
  busqueda?: string;
  destacados?: boolean;
  disponibles?: boolean;
  limit?: number;
  offset?: number;
}

export interface ProductoCatalogo {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  precioOferta?: number;
  categoria: string;
  marca?: string;
  imagen?: string;
  disponible: boolean;
  stock: number;
  destacado: boolean;
  descuento?: number;
  etiquetas?: string[];
}

export interface ComboCatalogo {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  precioOriginal: number;
  descuento: number;
  imagen?: string;
  disponible: boolean;
  productos: {
    id: string;
    nombre: string;
    cantidad: number;
    precio: number;
  }[];
  destacado: boolean;
}

@Injectable()
export class CatalogoService {
  constructor(
    @InjectRepository(Producto)
    private productoRepository: Repository<Producto>,
    @InjectRepository(Combo)
    private comboRepository: Repository<Combo>,
  ) {}

  async obtenerProductos(filtros: FiltrosCatalogo = {}): Promise<{
    productos: ProductoCatalogo[];
    total: number;
    pagina: number;
    totalPaginas: number;
  }> {
    const {
      categoria,
      marca,
      precioMin,
      precioMax,
      busqueda,
      destacados,
      disponibles = true,
      limit = 20,
      offset = 0,
    } = filtros;

    let query = this.productoRepository.createQueryBuilder('producto')
      .where('producto.isActive = :isActive', { isActive: true });

    // Filtro por disponibilidad
    if (disponibles) {
      query = query.andWhere('producto.stock > 0');
    }

    // Filtro por categoría
    if (categoria) {
      query = query.andWhere('producto.categoria = :categoria', { categoria });
    }

    // Filtro por marca
    if (marca) {
      query = query.andWhere('producto.marca = :marca', { marca });
    }

    // Filtro por rango de precios
    if (precioMin !== undefined) {
      query = query.andWhere('producto.precio >= :precioMin', { precioMin });
    }

    if (precioMax !== undefined) {
      query = query.andWhere('producto.precio <= :precioMax', { precioMax });
    }

    // Filtro por búsqueda
    if (busqueda) {
      query = query.andWhere(
        '(producto.nombre ILIKE :busqueda OR producto.descripcion ILIKE :busqueda OR producto.codigo ILIKE :busqueda)',
        { busqueda: `%${busqueda}%` }
      );
    }

    // Filtro por destacados
    if (destacados) {
      query = query.andWhere('producto.esDestacado = :destacados', { destacados });
    }

    // Contar total
    const total = await query.getCount();

    // Aplicar paginación y ordenamiento
    const productos = await query
      .orderBy('producto.esDestacado', 'DESC')
      .addOrderBy('producto.nombre', 'ASC')
      .skip(offset)
      .take(limit)
      .getMany();

    // Transformar a formato de catálogo
    const productosCatalogo: ProductoCatalogo[] = productos.map(producto => ({
      id: producto.id,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: Number(producto.precio),
      precioOferta: producto.precioOferta ? Number(producto.precioOferta) : undefined,
      categoria: producto.categoria,
      marca: producto.marca,
      imagen: producto.imagen,
      disponible: producto.stock > 0,
      stock: producto.stock,
      destacado: producto.esDestacado,
      descuento: producto.precioOferta 
        ? Math.round(((Number(producto.precio) - Number(producto.precioOferta)) / Number(producto.precio)) * 100)
        : undefined,
      etiquetas: this.generarEtiquetas(producto),
    }));

    const totalPaginas = Math.ceil(total / limit);
    const pagina = Math.floor(offset / limit) + 1;

    return {
      productos: productosCatalogo,
      total,
      pagina,
      totalPaginas,
    };
  }

  async obtenerCombos(filtros: { destacados?: boolean; disponibles?: boolean; limit?: number; offset?: number } = {}): Promise<{
    combos: ComboCatalogo[];
    total: number;
    pagina: number;
    totalPaginas: number;
  }> {
    const {
      destacados,
      disponibles = true,
      limit = 20,
      offset = 0,
    } = filtros;

    let query = this.comboRepository.createQueryBuilder('combo')
      .leftJoinAndSelect('combo.productos', 'comboProducto')
      .leftJoinAndSelect('comboProducto.producto', 'producto')
      .where('combo.isActive = :isActive', { isActive: true });

    // Filtro por disponibilidad
    if (disponibles) {
      query = query.andWhere('combo.estaDisponible = :disponible', { disponible: true });
    }

    // Filtro por destacados
    if (destacados) {
      query = query.andWhere('combo.esDestacado = :destacados', { destacados });
    }

    // Contar total
    const total = await query.getCount();

    // Aplicar paginación y ordenamiento
    const combos = await query
      .orderBy('combo.esDestacado', 'DESC')
      .addOrderBy('combo.nombre', 'ASC')
      .skip(offset)
      .take(limit)
      .getMany();

    // Transformar a formato de catálogo
    const combosCatalogo: ComboCatalogo[] = combos.map(combo => ({
      id: combo.id,
      nombre: combo.nombre,
      descripcion: combo.descripcion,
      precio: Number(combo.precioCombo),
      precioOriginal: Number(combo.precioOriginal),
      descuento: Number(combo.descuento),
      imagen: combo.imagen,
      disponible: combo.estaDisponible,
      productos: combo.productos?.map(cp => ({
        id: cp.producto.id,
        nombre: cp.producto.nombre,
        cantidad: cp.cantidad,
        precio: Number(cp.producto.precio),
      })) || [],
      destacado: combo.esDestacado,
    }));

    const totalPaginas = Math.ceil(total / limit);
    const pagina = Math.floor(offset / limit) + 1;

    return {
      combos: combosCatalogo,
      total,
      pagina,
      totalPaginas,
    };
  }

  async obtenerProductoDetalle(id: string): Promise<ProductoCatalogo | null> {
    const producto = await this.productoRepository.findOne({
      where: { id, isActive: true },
    });

    if (!producto) {
      return null;
    }

    return {
      id: producto.id,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: Number(producto.precio),
      precioOferta: producto.precioOferta ? Number(producto.precioOferta) : undefined,
      categoria: producto.categoria,
      marca: producto.marca,
      imagen: producto.imagen,
      disponible: producto.stock > 0,
      stock: producto.stock,
      destacado: producto.esDestacado,
      descuento: producto.precioOferta 
        ? Math.round(((Number(producto.precio) - Number(producto.precioOferta)) / Number(producto.precio)) * 100)
        : undefined,
      etiquetas: this.generarEtiquetas(producto),
    };
  }

  async obtenerComboDetalle(id: string): Promise<ComboCatalogo | null> {
    const combo = await this.comboRepository.findOne({
      where: { id, isActive: true },
      relations: ['productos', 'productos.producto'],
    });

    if (!combo) {
      return null;
    }

    return {
      id: combo.id,
      nombre: combo.nombre,
      descripcion: combo.descripcion,
      precio: Number(combo.precioCombo),
      precioOriginal: Number(combo.precioOriginal),
      descuento: Number(combo.descuento),
      imagen: combo.imagen,
      disponible: combo.estaDisponible,
      productos: combo.productos?.map(cp => ({
        id: cp.producto.id,
        nombre: cp.producto.nombre,
        cantidad: cp.cantidad,
        precio: Number(cp.producto.precio),
      })) || [],
      destacado: combo.esDestacado,
    };
  }

  async obtenerCategorias(): Promise<{
    categoria: string;
    totalProductos: number;
    productosDisponibles: number;
  }[]> {
    const categorias = await this.productoRepository
      .createQueryBuilder('producto')
      .select('producto.categoria', 'categoria')
      .addSelect('COUNT(*)', 'totalProductos')
      .addSelect('SUM(CASE WHEN producto.stock > 0 THEN 1 ELSE 0 END)', 'productosDisponibles')
      .where('producto.isActive = :isActive', { isActive: true })
      .groupBy('producto.categoria')
      .orderBy('categoria', 'ASC')
      .getRawMany();

    return categorias.map(cat => ({
      categoria: cat.categoria,
      totalProductos: parseInt(cat.totalProductos),
      productosDisponibles: parseInt(cat.productosDisponibles),
    }));
  }

  async obtenerMarcas(): Promise<{
    marca: string;
    totalProductos: number;
    productosDisponibles: number;
  }[]> {
    const marcas = await this.productoRepository
      .createQueryBuilder('producto')
      .select('producto.marca', 'marca')
      .addSelect('COUNT(*)', 'totalProductos')
      .addSelect('SUM(CASE WHEN producto.stock > 0 THEN 1 ELSE 0 END)', 'productosDisponibles')
      .where('producto.isActive = :isActive AND producto.marca IS NOT NULL', { isActive: true })
      .groupBy('producto.marca')
      .orderBy('marca', 'ASC')
      .getRawMany();

    return marcas.map(marca => ({
      marca: marca.marca,
      totalProductos: parseInt(marca.totalProductos),
      productosDisponibles: parseInt(marca.productosDisponibles),
    }));
  }

  async obtenerDestacados(): Promise<{
    productos: ProductoCatalogo[];
    combos: ComboCatalogo[];
  }> {
    const productos = await this.obtenerProductos({ 
      destacados: true, 
      disponibles: true, 
      limit: 10 
    });

    const combos = await this.obtenerCombos({ 
      destacados: true, 
      disponibles: true, 
      limit: 5 
    });

    return {
      productos: productos.productos,
      combos: combos.combos,
    };
  }

  async obtenerNovedades(): Promise<ProductoCatalogo[]> {
    const productos = await this.productoRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
      take: 10,
    });

    return productos
      .filter(producto => producto.stock > 0)
      .map(producto => ({
        id: producto.id,
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precio: Number(producto.precio),
        precioOferta: producto.precioOferta ? Number(producto.precioOferta) : undefined,
        categoria: producto.categoria,
        marca: producto.marca,
        imagen: producto.imagen,
        disponible: producto.stock > 0,
        stock: producto.stock,
        destacado: producto.esDestacado,
        descuento: producto.precioOferta 
          ? Math.round(((Number(producto.precio) - Number(producto.precioOferta)) / Number(producto.precio)) * 100)
          : undefined,
        etiquetas: this.generarEtiquetas(producto),
      }));
  }

  async obtenerOfertas(): Promise<ProductoCatalogo[]> {
    const productos = await this.productoRepository.find({
      where: { 
        isActive: true,
        precioOferta: In(['NOT NULL']),
      },
      order: { precioOferta: 'ASC' },
      take: 20,
    });

    return productos
      .filter(producto => producto.stock > 0 && producto.precioOferta)
      .map(producto => ({
        id: producto.id,
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precio: Number(producto.precio),
        precioOferta: Number(producto.precioOferta),
        categoria: producto.categoria,
        marca: producto.marca,
        imagen: producto.imagen,
        disponible: producto.stock > 0,
        stock: producto.stock,
        destacado: producto.esDestacado,
        descuento: Math.round(((Number(producto.precio) - Number(producto.precioOferta)) / Number(producto.precio)) * 100),
        etiquetas: this.generarEtiquetas(producto),
      }));
  }

  async buscar(termino: string, limit: number = 20): Promise<{
    productos: ProductoCatalogo[];
    combos: ComboCatalogo[];
    total: number;
  }> {
    const productos = await this.obtenerProductos({ 
      busqueda: termino, 
      disponibles: true, 
      limit 
    });

    const combos = await this.comboRepository.find({
      where: [
        { nombre: Like(`%${termino}%`), isActive: true },
        { descripcion: Like(`%${termino}%`), isActive: true },
      ],
      relations: ['productos', 'productos.producto'],
      take: Math.floor(limit / 2),
    });

    const combosCatalogo: ComboCatalogo[] = combos
      .filter(combo => combo.estaDisponible)
      .map(combo => ({
        id: combo.id,
        nombre: combo.nombre,
        descripcion: combo.descripcion,
        precio: Number(combo.precioCombo),
        precioOriginal: Number(combo.precioOriginal),
        descuento: Number(combo.descuento),
        imagen: combo.imagen,
        disponible: combo.estaDisponible,
        productos: combo.productos?.map(cp => ({
          id: cp.producto.id,
          nombre: cp.producto.nombre,
          cantidad: cp.cantidad,
          precio: Number(cp.producto.precio),
        })) || [],
        destacado: combo.esDestacado,
      }));

    return {
      productos: productos.productos,
      combos: combosCatalogo,
      total: productos.total + combosCatalogo.length,
    };
  }

  private generarEtiquetas(producto: Producto): string[] {
    const etiquetas: string[] = [];

    if (producto.esDestacado) {
      etiquetas.push('Destacado');
    }

    if (producto.precioOferta) {
      etiquetas.push('Oferta');
    }

    if (producto.stock <= producto.stockMinimo) {
      etiquetas.push('Últimas unidades');
    }

    if (producto.stock > 50) {
      etiquetas.push('Stock disponible');
    }

    // Agregar etiqueta por categoría
    if (producto.categoria) {
      etiquetas.push(producto.categoria);
    }

    return etiquetas;
  }
}

