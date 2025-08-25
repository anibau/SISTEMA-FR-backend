import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { Gasto, CategoriaGasto, EstadoGasto } from './entities/gasto.entity';
import { CreateGastoDto, AprobarGastoDto, RechazarGastoDto, PagarGastoDto } from './dto/create-gasto.dto';
import { UpdateGastoDto } from './dto/update-gasto.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class GastosService {
  constructor(
    @InjectRepository(Gasto)
    private gastoRepository: Repository<Gasto>,
  ) {}

  async create(createGastoDto: CreateGastoDto): Promise<Gasto> {
    // Generar número de gasto único
    const numeroGasto = await this.generarNumeroGasto();

    const gasto = this.gastoRepository.create({
      ...createGastoDto,
      numeroGasto,
    });

    // Calcular mes y año automáticamente
    gasto.calcularMesAño();

    return await this.gastoRepository.save(gasto);
  }

  async findAll(paginationDto: PaginationDto): Promise<{
    data: Gasto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [gastos, total] = await this.gastoRepository.findAndCount({
      where: { isActive: true },
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: gastos,
      total,
      page,
      limit,
    };
  }

  async findByUsuario(usuarioId: string, paginationDto: PaginationDto): Promise<{
    data: Gasto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [gastos, total] = await this.gastoRepository.findAndCount({
      where: { usuarioId, isActive: true },
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: gastos,
      total,
      page,
      limit,
    };
  }

  async findByCategoria(categoria: CategoriaGasto): Promise<Gasto[]> {
    return await this.gastoRepository.find({
      where: { categoria, isActive: true },
      order: { fechaGasto: 'DESC' },
    });
  }

  async findByEstado(estado: EstadoGasto): Promise<Gasto[]> {
    return await this.gastoRepository.find({
      where: { estado, isActive: true },
      order: { fechaGasto: 'DESC' },
    });
  }

  async findPendientes(): Promise<Gasto[]> {
    return await this.findByEstado(EstadoGasto.PENDIENTE);
  }

  async findAprobados(): Promise<Gasto[]> {
    return await this.findByEstado(EstadoGasto.APROBADO);
  }

  async findPagados(): Promise<Gasto[]> {
    return await this.findByEstado(EstadoGasto.PAGADO);
  }

  async findVencidos(): Promise<Gasto[]> {
    const gastos = await this.gastoRepository.find({
      where: { 
        estado: In([EstadoGasto.PENDIENTE, EstadoGasto.APROBADO]),
        isActive: true,
      },
      order: { fechaGasto: 'ASC' },
    });

    return gastos.filter(gasto => gasto.estaVencido);
  }

  async findByMesAño(mes: number, año: number): Promise<Gasto[]> {
    return await this.gastoRepository.find({
      where: { mes, año, isActive: true },
      order: { fechaGasto: 'DESC' },
    });
  }

  async findByRangoFechas(fechaInicio: Date, fechaFin: Date): Promise<Gasto[]> {
    return await this.gastoRepository.find({
      where: {
        fechaGasto: Between(fechaInicio, fechaFin),
        isActive: true,
      },
      order: { fechaGasto: 'DESC' },
    });
  }

  async findRecurrentes(): Promise<Gasto[]> {
    return await this.gastoRepository.find({
      where: { esRecurrente: true, isActive: true },
      order: { diaRecurrencia: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Gasto> {
    const gasto = await this.gastoRepository.findOne({
      where: { id, isActive: true },
    });

    if (!gasto) {
      throw new NotFoundException('Gasto no encontrado');
    }

    return gasto;
  }

  async findByNumeroGasto(numeroGasto: string): Promise<Gasto> {
    const gasto = await this.gastoRepository.findOne({
      where: { numeroGasto, isActive: true },
    });

    if (!gasto) {
      throw new NotFoundException('Gasto no encontrado');
    }

    return gasto;
  }

  async update(id: string, updateGastoDto: UpdateGastoDto): Promise<Gasto> {
    const gasto = await this.findOne(id);

    if (!gasto.puedeModificar) {
      throw new BadRequestException('Solo se pueden modificar gastos pendientes');
    }

    Object.assign(gasto, updateGastoDto);

    // Recalcular mes y año si cambió la fecha
    if (updateGastoDto.fechaGasto) {
      gasto.calcularMesAño();
    }

    return await this.gastoRepository.save(gasto);
  }

  async aprobar(id: string, aprobadorId: string, nombreAprobador: string, aprobarDto?: AprobarGastoDto): Promise<Gasto> {
    const gasto = await this.findOne(id);

    try {
      gasto.aprobar(aprobadorId, nombreAprobador);
      
      if (aprobarDto?.observaciones) {
        gasto.observaciones = aprobarDto.observaciones;
      }

      return await this.gastoRepository.save(gasto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async rechazar(id: string, aprobadorId: string, nombreAprobador: string, rechazarDto: RechazarGastoDto): Promise<Gasto> {
    const gasto = await this.findOne(id);

    try {
      gasto.rechazar(aprobadorId, nombreAprobador, rechazarDto.motivo);
      
      if (rechazarDto.observaciones) {
        gasto.observaciones = rechazarDto.observaciones;
      }

      return await this.gastoRepository.save(gasto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async marcarComoPagado(id: string, pagarDto: PagarGastoDto): Promise<Gasto> {
    const gasto = await this.findOne(id);

    try {
      gasto.marcarComoPagado(pagarDto.metodoPago, pagarDto.numeroOperacion, pagarDto.cierreCajaId);
      
      if (pagarDto.observaciones) {
        gasto.observaciones = pagarDto.observaciones;
      }

      return await this.gastoRepository.save(gasto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async agregarArchivo(id: string, nombre: string, url: string, tipo: string, tamaño: number): Promise<Gasto> {
    const gasto = await this.findOne(id);
    
    gasto.agregarArchivo(nombre, url, tipo, tamaño);
    return await this.gastoRepository.save(gasto);
  }

  async removerArchivo(id: string, nombreArchivo: string): Promise<Gasto> {
    const gasto = await this.findOne(id);
    
    gasto.removerArchivo(nombreArchivo);
    return await this.gastoRepository.save(gasto);
  }

  async obtenerResumenPorCategoria(mes?: number, año?: number): Promise<{
    categoria: CategoriaGasto;
    totalGastos: number;
    montoTotal: number;
    gastosAprobados: number;
    gastosPagados: number;
  }[]> {
    let whereCondition: any = { isActive: true };
    
    if (mes && año) {
      whereCondition = { ...whereCondition, mes, año };
    }

    const gastos = await this.gastoRepository.find({
      where: whereCondition,
    });

    const resumenPorCategoria = Object.values(CategoriaGasto).map(categoria => {
      const gastosCategoria = gastos.filter(g => g.categoria === categoria);
      
      return {
        categoria,
        totalGastos: gastosCategoria.length,
        montoTotal: gastosCategoria.reduce((sum, g) => sum + Number(g.monto), 0),
        gastosAprobados: gastosCategoria.filter(g => g.estaAprobado || g.estaPagado).length,
        gastosPagados: gastosCategoria.filter(g => g.estaPagado).length,
      };
    });

    return resumenPorCategoria.filter(r => r.totalGastos > 0);
  }

  async obtenerResumenMensual(año: number): Promise<{
    mes: number;
    nombreMes: string;
    totalGastos: number;
    montoTotal: number;
    gastosPendientes: number;
    gastosAprobados: number;
    gastosPagados: number;
  }[]> {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const resumenMensual = [];

    for (let mes = 1; mes <= 12; mes++) {
      const gastos = await this.gastoRepository.find({
        where: { mes, año, isActive: true },
      });

      resumenMensual.push({
        mes,
        nombreMes: meses[mes - 1],
        totalGastos: gastos.length,
        montoTotal: gastos.reduce((sum, g) => sum + Number(g.monto), 0),
        gastosPendientes: gastos.filter(g => g.estaPendiente).length,
        gastosAprobados: gastos.filter(g => g.estaAprobado).length,
        gastosPagados: gastos.filter(g => g.estaPagado).length,
      });
    }

    return resumenMensual;
  }

  async getEstadisticas(): Promise<{
    totalGastos: number;
    gastosPendientes: number;
    gastosAprobados: number;
    gastosPagados: number;
    gastosRechazados: number;
    gastosVencidos: number;
    montoTotalMes: number;
    montoTotalAño: number;
    categoriaMayorGasto: string;
    promedioGastoDiario: number;
  }> {
    const total = await this.gastoRepository.count({ where: { isActive: true } });
    const pendientes = await this.gastoRepository.count({ where: { estado: EstadoGasto.PENDIENTE, isActive: true } });
    const aprobados = await this.gastoRepository.count({ where: { estado: EstadoGasto.APROBADO, isActive: true } });
    const pagados = await this.gastoRepository.count({ where: { estado: EstadoGasto.PAGADO, isActive: true } });
    const rechazados = await this.gastoRepository.count({ where: { estado: EstadoGasto.RECHAZADO, isActive: true } });

    const gastosVencidos = await this.findVencidos();

    const fechaActual = new Date();
    const mesActual = fechaActual.getMonth() + 1;
    const añoActual = fechaActual.getFullYear();

    const gastosMes = await this.gastoRepository.find({
      where: { mes: mesActual, año: añoActual, isActive: true },
    });

    const gastosAño = await this.gastoRepository.find({
      where: { año: añoActual, isActive: true },
    });

    const montoTotalMes = gastosMes.reduce((sum, g) => sum + Number(g.monto), 0);
    const montoTotalAño = gastosAño.reduce((sum, g) => sum + Number(g.monto), 0);

    // Calcular categoría con mayor gasto
    const resumenCategorias = await this.obtenerResumenPorCategoria(mesActual, añoActual);
    const categoriaMayorGasto = resumenCategorias.length > 0 
      ? resumenCategorias.reduce((max, cat) => cat.montoTotal > max.montoTotal ? cat : max).categoria
      : 'N/A';

    // Calcular promedio diario del mes
    const diasDelMes = new Date(añoActual, mesActual, 0).getDate();
    const promedioGastoDiario = montoTotalMes / diasDelMes;

    return {
      totalGastos: total,
      gastosPendientes: pendientes,
      gastosAprobados: aprobados,
      gastosPagados: pagados,
      gastosRechazados: rechazados,
      gastosVencidos: gastosVencidos.length,
      montoTotalMes: Math.round(montoTotalMes * 100) / 100,
      montoTotalAño: Math.round(montoTotalAño * 100) / 100,
      categoriaMayorGasto,
      promedioGastoDiario: Math.round(promedioGastoDiario * 100) / 100,
    };
  }

  async crearGastosRecurrentes(): Promise<{
    gastosCreados: number;
    gastosCreados_detalles: Gasto[];
  }> {
    const gastosRecurrentes = await this.findRecurrentes();
    const fechaActual = new Date();
    const mesActual = fechaActual.getMonth() + 1;
    const añoActual = fechaActual.getFullYear();
    const diaActual = fechaActual.getDate();

    const gastosCreados: Gasto[] = [];

    for (const gastoRecurrente of gastosRecurrentes) {
      // Verificar si ya existe un gasto para este mes
      const gastoExistente = await this.gastoRepository.findOne({
        where: {
          descripcion: gastoRecurrente.descripcion,
          categoria: gastoRecurrente.categoria,
          mes: mesActual,
          año: añoActual,
          isActive: true,
        },
      });

      // Solo crear si no existe y si ya pasó el día de recurrencia
      if (!gastoExistente && gastoRecurrente.diaRecurrencia && diaActual >= gastoRecurrente.diaRecurrencia) {
        const nuevoGasto = await this.create({
          descripcion: `${gastoRecurrente.descripcion} - ${mesActual}/${añoActual}`,
          categoria: gastoRecurrente.categoria,
          monto: gastoRecurrente.monto,
          fechaGasto: new Date(añoActual, mesActual - 1, gastoRecurrente.diaRecurrencia),
          usuarioId: gastoRecurrente.usuarioId,
          usuarioNombre: gastoRecurrente.usuarioNombre,
          tipoComprobante: gastoRecurrente.tipoComprobante,
          rucProveedor: gastoRecurrente.rucProveedor,
          nombreProveedor: gastoRecurrente.nombreProveedor,
          observaciones: `Gasto recurrente generado automáticamente`,
          esRecurrente: false, // El nuevo gasto no es recurrente
          cuentaContable: gastoRecurrente.cuentaContable,
          centroCosto: gastoRecurrente.centroCosto,
        });

        gastosCreados.push(nuevoGasto);
      }
    }

    return {
      gastosCreados: gastosCreados.length,
      gastosCreados_detalles: gastosCreados,
    };
  }

  async remove(id: string): Promise<void> {
    const gasto = await this.findOne(id);
    
    if (!gasto.puedeModificar) {
      throw new BadRequestException('Solo se pueden eliminar gastos pendientes');
    }
    
    gasto.isActive = false;
    await this.gastoRepository.save(gasto);
  }

  // Métodos privados de utilidad
  private async generarNumeroGasto(): Promise<string> {
    const fecha = new Date();
    const año = fecha.getFullYear().toString().slice(-2);
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const dia = fecha.getDate().toString().padStart(2, '0');
    
    // Buscar el último número del día
    const prefijo = `GST${año}${mes}${dia}`;
    const ultimoGasto = await this.gastoRepository.findOne({
      where: { numeroGasto: Between(`${prefijo}000`, `${prefijo}999`) },
      order: { numeroGasto: 'DESC' },
    });

    let numeroSecuencial = 1;
    if (ultimoGasto) {
      const ultimoNumero = parseInt(ultimoGasto.numeroGasto.slice(-3));
      numeroSecuencial = ultimoNumero + 1;
    }

    return `${prefijo}${numeroSecuencial.toString().padStart(3, '0')}`;
  }
}

