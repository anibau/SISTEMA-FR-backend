import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { CierreCaja, MovimientoCaja, EstadoCierre, TipoMovimientoCaja } from './entities/cierre-caja.entity';
import { CreateCierreCajaDto, CerrarCajaDto, CreateMovimientoCajaDto } from './dto/create-cierre-caja.dto';
import { UpdateCierreCajaDto } from './dto/update-cierre-caja.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class CierresCajaService {
  constructor(
    @InjectRepository(CierreCaja)
    private cierreCajaRepository: Repository<CierreCaja>,
    @InjectRepository(MovimientoCaja)
    private movimientoCajaRepository: Repository<MovimientoCaja>,
  ) {}

  async abrirCaja(createDto: CreateCierreCajaDto): Promise<CierreCaja> {
    // Verificar que no haya una caja abierta para este usuario
    const cajaAbierta = await this.cierreCajaRepository.findOne({
      where: {
        usuarioId: createDto.usuarioId,
        estado: EstadoCierre.ABIERTO,
        isActive: true,
      },
    });

    if (cajaAbierta) {
      throw new ConflictException('Ya tienes una caja abierta. Debes cerrarla primero.');
    }

    // Generar número de cierre único
    const numeroCierre = await this.generarNumeroCierre();

    const cierre = this.cierreCajaRepository.create({
      ...createDto,
      numeroCierre,
      fechaApertura: new Date(),
      horaApertura: new Date().toTimeString().slice(0, 5),
      montoInicialEfectivo: createDto.montoInicialEfectivo || 0,
      montoInicialYape: createDto.montoInicialYape || 0,
      montoInicialPlin: createDto.montoInicialPlin || 0,
      montoInicialTransferencia: createDto.montoInicialTransferencia || 0,
    });

    return await this.cierreCajaRepository.save(cierre);
  }

  async cerrarCaja(id: string, cerrarDto: CerrarCajaDto): Promise<CierreCaja> {
    const cierre = await this.findOne(id);

    if (!cierre.estaAbierto) {
      throw new BadRequestException('Solo se pueden cerrar cajas abiertas');
    }

    // Actualizar montos contados
    cierre.montoContadoEfectivo = cerrarDto.montoContadoEfectivo;
    cierre.montoContadoYape = cerrarDto.montoContadoYape || 0;
    cierre.montoContadoPlin = cerrarDto.montoContadoPlin || 0;
    cierre.montoContadoTransferencia = cerrarDto.montoContadoTransferencia || 0;
    cierre.clientesAtendidos = cerrarDto.clientesAtendidos;

    if (cerrarDto.observaciones) {
      cierre.observaciones = cerrarDto.observaciones;
    }

    if (cerrarDto.motivoDiferencia) {
      cierre.motivoDiferencia = cerrarDto.motivoDiferencia;
    }

    // Cerrar la caja (esto calcula automáticamente las diferencias)
    cierre.cerrar();

    return await this.cierreCajaRepository.save(cierre);
  }

  async findAll(paginationDto: PaginationDto): Promise<{
    data: CierreCaja[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [cierres, total] = await this.cierreCajaRepository.findAndCount({
      where: { isActive: true },
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: cierres,
      total,
      page,
      limit,
    };
  }

  async findByUsuario(usuarioId: string, paginationDto: PaginationDto): Promise<{
    data: CierreCaja[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [cierres, total] = await this.cierreCajaRepository.findAndCount({
      where: { usuarioId, isActive: true },
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: cierres,
      total,
      page,
      limit,
    };
  }

  async findByEstado(estado: EstadoCierre): Promise<CierreCaja[]> {
    return await this.cierreCajaRepository.find({
      where: { estado, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findCajasAbiertas(): Promise<CierreCaja[]> {
    return await this.findByEstado(EstadoCierre.ABIERTO);
  }

  async findCajasPendientesRevision(): Promise<CierreCaja[]> {
    return await this.findByEstado(EstadoCierre.CERRADO);
  }

  async findCajasConDesbalance(): Promise<CierreCaja[]> {
    const cierres = await this.cierreCajaRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });

    return cierres.filter(cierre => cierre.tieneDesbalance);
  }

  async findOne(id: string): Promise<CierreCaja> {
    const cierre = await this.cierreCajaRepository.findOne({
      where: { id, isActive: true },
    });

    if (!cierre) {
      throw new NotFoundException('Cierre de caja no encontrado');
    }

    return cierre;
  }

  async findByNumeroCierre(numeroCierre: string): Promise<CierreCaja> {
    const cierre = await this.cierreCajaRepository.findOne({
      where: { numeroCierre, isActive: true },
    });

    if (!cierre) {
      throw new NotFoundException('Cierre de caja no encontrado');
    }

    return cierre;
  }

  async update(id: string, updateDto: UpdateCierreCajaDto): Promise<CierreCaja> {
    const cierre = await this.findOne(id);

    if (!cierre.estaAbierto) {
      throw new BadRequestException('Solo se pueden modificar cajas abiertas');
    }

    Object.assign(cierre, updateDto);
    return await this.cierreCajaRepository.save(cierre);
  }

  async revisar(id: string, supervisorId: string, supervisorNombre: string, observaciones?: string): Promise<CierreCaja> {
    const cierre = await this.findOne(id);

    try {
      cierre.revisar(supervisorId, supervisorNombre);
      
      if (observaciones) {
        cierre.observaciones = observaciones;
      }

      return await this.cierreCajaRepository.save(cierre);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async aprobar(id: string, supervisorId: string, supervisorNombre: string, observaciones?: string): Promise<CierreCaja> {
    const cierre = await this.findOne(id);

    try {
      cierre.aprobar(supervisorId, supervisorNombre);
      
      if (observaciones) {
        cierre.observaciones = observaciones;
      }

      return await this.cierreCajaRepository.save(cierre);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async registrarVenta(cierreCajaId: string, ventaId: string, numeroTicket: string, monto: number, metodoPago: string): Promise<void> {
    const cierre = await this.findOne(cierreCajaId);

    if (!cierre.estaAbierto) {
      throw new BadRequestException('No se pueden registrar ventas en una caja cerrada');
    }

    // Agregar venta al detalle
    cierre.agregarVenta(ventaId, numeroTicket, monto, metodoPago);

    // Crear movimiento de caja
    const tipoMovimiento = this.obtenerTipoMovimientoPorMetodoPago(metodoPago);
    await this.crearMovimiento({
      cierreCajaId,
      tipo: tipoMovimiento,
      monto,
      descripcion: `Venta ${numeroTicket}`,
      referenciaId: ventaId,
      numeroReferencia: numeroTicket,
    });

    await this.cierreCajaRepository.save(cierre);
  }

  async registrarGasto(cierreCajaId: string, gastoId: string, descripcion: string, monto: number, categoria: string): Promise<void> {
    const cierre = await this.findOne(cierreCajaId);

    if (!cierre.estaAbierto) {
      throw new BadRequestException('No se pueden registrar gastos en una caja cerrada');
    }

    // Agregar gasto al detalle
    cierre.agregarGasto(gastoId, descripcion, monto, categoria);

    // Crear movimiento de caja
    await this.crearMovimiento({
      cierreCajaId,
      tipo: TipoMovimientoCaja.GASTO,
      monto,
      descripcion,
      referenciaId: gastoId,
    });

    await this.cierreCajaRepository.save(cierre);
  }

  async crearMovimiento(createDto: CreateMovimientoCajaDto): Promise<MovimientoCaja> {
    const movimiento = this.movimientoCajaRepository.create(createDto);
    return await this.movimientoCajaRepository.save(movimiento);
  }

  async obtenerMovimientos(cierreCajaId: string): Promise<MovimientoCaja[]> {
    return await this.movimientoCajaRepository.find({
      where: { cierreCajaId },
      order: { fechaMovimiento: 'ASC' },
    });
  }

  async obtenerResumenDiario(fecha?: Date): Promise<{
    fecha: string;
    totalCierres: number;
    cierresAbiertos: number;
    cierresCerrados: number;
    cierresAprobados: number;
    totalVentas: number;
    totalIngresos: number;
    totalGastos: number;
    totalDiferencias: number;
    cierresConDesbalance: number;
  }> {
    const fechaConsulta = fecha || new Date();
    const inicioDay = new Date(fechaConsulta);
    inicioDay.setHours(0, 0, 0, 0);
    const finDay = new Date(fechaConsulta);
    finDay.setHours(23, 59, 59, 999);

    const cierres = await this.cierreCajaRepository.find({
      where: {
        fechaApertura: Between(inicioDay, finDay),
        isActive: true,
      },
    });

    const totalCierres = cierres.length;
    const cierresAbiertos = cierres.filter(c => c.estado === EstadoCierre.ABIERTO).length;
    const cierresCerrados = cierres.filter(c => c.estado === EstadoCierre.CERRADO).length;
    const cierresAprobados = cierres.filter(c => c.estado === EstadoCierre.APROBADO).length;

    const totalVentas = cierres.reduce((sum, c) => sum + c.totalVentas, 0);
    const totalIngresos = cierres.reduce((sum, c) => sum + Number(c.totalVentasGeneral), 0);
    const totalGastos = cierres.reduce((sum, c) => sum + Number(c.totalMontoGastos), 0);
    const totalDiferencias = cierres.reduce((sum, c) => sum + Math.abs(Number(c.diferenciaTotal)), 0);
    const cierresConDesbalance = cierres.filter(c => c.tieneDesbalance).length;

    return {
      fecha: fechaConsulta.toISOString().split('T')[0],
      totalCierres,
      cierresAbiertos,
      cierresCerrados,
      cierresAprobados,
      totalVentas,
      totalIngresos,
      totalGastos,
      totalDiferencias,
      cierresConDesbalance,
    };
  }

  async getEstadisticas(): Promise<{
    cierresHoy: number;
    cierresAbiertos: number;
    cierresPendientesRevision: number;
    cierresConDesbalance: number;
    promedioVentasPorCierre: number;
    promedioTiempoOperacion: number;
    totalDiferenciasHoy: number;
    metodoPagoMasUsado: string;
  }> {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    const cierresHoy = await this.cierreCajaRepository.count({
      where: {
        fechaApertura: Between(hoy, manana),
        isActive: true,
      },
    });

    const cierresAbiertos = await this.cierreCajaRepository.count({
      where: { estado: EstadoCierre.ABIERTO, isActive: true },
    });

    const cierresPendientesRevision = await this.cierreCajaRepository.count({
      where: { estado: EstadoCierre.CERRADO, isActive: true },
    });

    const todosLosCierres = await this.cierreCajaRepository.find({
      where: { isActive: true },
    });

    const cierresConDesbalance = todosLosCierres.filter(c => c.tieneDesbalance).length;

    const cierresCerrados = todosLosCierres.filter(c => c.estaCerrado);
    const promedioVentasPorCierre = cierresCerrados.length > 0 
      ? cierresCerrados.reduce((sum, c) => sum + c.totalVentas, 0) / cierresCerrados.length 
      : 0;

    const promedioTiempoOperacion = cierresCerrados.length > 0
      ? cierresCerrados.reduce((sum, c) => sum + (c.minutosOperacion || 0), 0) / cierresCerrados.length
      : 0;

    const cierresHoyData = await this.cierreCajaRepository.find({
      where: {
        fechaApertura: Between(hoy, manana),
        isActive: true,
      },
    });

    const totalDiferenciasHoy = cierresHoyData.reduce((sum, c) => sum + Math.abs(Number(c.diferenciaTotal)), 0);

    // Calcular método de pago más usado
    let totalEfectivo = 0, totalYape = 0, totalPlin = 0, totalTransferencia = 0;
    
    cierresCerrados.forEach(c => {
      totalEfectivo += Number(c.totalVentasEfectivo);
      totalYape += Number(c.totalVentasYape);
      totalPlin += Number(c.totalVentasPlin);
      totalTransferencia += Number(c.totalVentasTransferencia);
    });

    const metodos = [
      { nombre: 'Efectivo', total: totalEfectivo },
      { nombre: 'Yape', total: totalYape },
      { nombre: 'Plin', total: totalPlin },
      { nombre: 'Transferencia', total: totalTransferencia },
    ];

    const metodoPagoMasUsado = metodos.reduce((max, metodo) => 
      metodo.total > max.total ? metodo : max
    ).nombre;

    return {
      cierresHoy,
      cierresAbiertos,
      cierresPendientesRevision,
      cierresConDesbalance,
      promedioVentasPorCierre: Math.round(promedioVentasPorCierre * 100) / 100,
      promedioTiempoOperacion: Math.round(promedioTiempoOperacion),
      totalDiferenciasHoy: Math.round(totalDiferenciasHoy * 100) / 100,
      metodoPagoMasUsado,
    };
  }

  async remove(id: string): Promise<void> {
    const cierre = await this.findOne(id);
    
    if (cierre.estaAbierto) {
      throw new BadRequestException('No se puede eliminar una caja abierta');
    }
    
    cierre.isActive = false;
    await this.cierreCajaRepository.save(cierre);
  }

  // Métodos privados de utilidad
  private async generarNumeroCierre(): Promise<string> {
    const fecha = new Date();
    const año = fecha.getFullYear().toString().slice(-2);
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const dia = fecha.getDate().toString().padStart(2, '0');
    
    // Buscar el último número del día
    const prefijo = `CJ${año}${mes}${dia}`;
    const ultimoCierre = await this.cierreCajaRepository.findOne({
      where: { numeroCierre: Between(`${prefijo}000`, `${prefijo}999`) },
      order: { numeroCierre: 'DESC' },
    });

    let numeroSecuencial = 1;
    if (ultimoCierre) {
      const ultimoNumero = parseInt(ultimoCierre.numeroCierre.slice(-3));
      numeroSecuencial = ultimoNumero + 1;
    }

    return `${prefijo}${numeroSecuencial.toString().padStart(3, '0')}`;
  }

  private obtenerTipoMovimientoPorMetodoPago(metodoPago: string): TipoMovimientoCaja {
    switch (metodoPago.toLowerCase()) {
      case 'efectivo':
        return TipoMovimientoCaja.VENTA_EFECTIVO;
      case 'yape':
        return TipoMovimientoCaja.VENTA_YAPE;
      case 'plin':
        return TipoMovimientoCaja.VENTA_PLIN;
      case 'transferencia':
        return TipoMovimientoCaja.VENTA_TRANSFERENCIA;
      default:
        return TipoMovimientoCaja.VENTA_EFECTIVO;
    }
  }
}

