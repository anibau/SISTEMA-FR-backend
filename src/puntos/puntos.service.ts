import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import {
  PuntoMovimiento,
  PuntoCanje,
  PuntoConfiguracion,
  TipoMovimientoPunto,
  EstadoPunto,
} from './entities/punto.entity';
import {
  CrearMovimientoPuntoDto,
  CanjearPuntosDto,
  AjustarPuntosDto,
  ConsultarPuntosDto,
} from './dto/crear-movimiento.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class PuntosService {
  constructor(
    @InjectRepository(PuntoMovimiento)
    private puntoMovimientoRepository: Repository<PuntoMovimiento>,
    @InjectRepository(PuntoCanje)
    private puntoCanjeRepository: Repository<PuntoCanje>,
    @InjectRepository(PuntoConfiguracion)
    private puntoConfiguracionRepository: Repository<PuntoConfiguracion>,
  ) {}

  async crearMovimiento(
    dto: CrearMovimientoPuntoDto,
    usuarioId?: string,
  ): Promise<PuntoMovimiento> {
    // Obtener saldo actual del cliente
    const saldoActual = await this.obtenerSaldoCliente(dto.clienteId);

    // Validar que no se pueda usar más puntos de los disponibles
    if (dto.puntos < 0 && Math.abs(dto.puntos) > saldoActual) {
      throw new BadRequestException('Puntos insuficientes');
    }

    const nuevoSaldo = saldoActual + dto.puntos;

    // Calcular fecha de vencimiento para puntos ganados
    let fechaVencimiento: Date | undefined;
    if (dto.puntos > 0) {
      fechaVencimiento = await this.calcularFechaVencimiento();
    }

    const movimiento = this.puntoMovimientoRepository.create({
      ...dto,
      saldoAnterior: saldoActual,
      saldoNuevo: nuevoSaldo,
      fechaVencimiento,
      creadoPor: usuarioId,
    });

    return await this.puntoMovimientoRepository.save(movimiento);
  }

  async calcularPuntosPorCompra(montoCompra: number): Promise<number> {
    const configuracion = await this.obtenerConfiguracion('soles_por_punto');
    const solesPorPunto = configuracion?.valorNumerico || 10;
    
    return Math.floor(montoCompra / solesPorPunto);
  }

  async otorgarPuntosPorCompra(
    clienteId: string,
    montoCompra: number,
    ventaId: string,
    usuarioId?: string,
  ): Promise<PuntoMovimiento> {
    const puntosGanados = await this.calcularPuntosPorCompra(montoCompra);
    
    if (puntosGanados <= 0) {
      throw new BadRequestException('El monto de compra no genera puntos');
    }

    return await this.crearMovimiento({
      clienteId,
      tipo: TipoMovimientoPunto.GANADO,
      puntos: puntosGanados,
      ventaId,
      montoCompra,
      descripcion: `Puntos ganados por compra de S/ ${montoCompra}`,
    }, usuarioId);
  }

  async canjearPuntos(
    dto: CanjearPuntosDto,
    usuarioId?: string,
  ): Promise<{ canje: PuntoCanje; movimiento: PuntoMovimiento }> {
    // Verificar saldo disponible
    const saldoActual = await this.obtenerSaldoCliente(dto.clienteId);
    
    if (dto.puntosUsados > saldoActual) {
      throw new BadRequestException('Puntos insuficientes');
    }

    // Verificar mínimo de canje
    const configuracion = await this.obtenerConfiguracion('minimo_canje');
    const minimoCanje = configuracion?.valorNumerico || 100;
    
    if (dto.puntosUsados < minimoCanje) {
      throw new BadRequestException(`Mínimo de canje: ${minimoCanje} puntos`);
    }

    // Calcular valor en soles
    const valorSoles = await this.calcularValorCanje(dto.puntosUsados);

    // Crear registro de canje
    const canje = this.puntoCanjeRepository.create({
      ...dto,
      valorSoles,
      autorizadoPor: usuarioId,
    });

    const canjeGuardado = await this.puntoCanjeRepository.save(canje);

    // Crear movimiento de puntos
    const movimiento = await this.crearMovimiento({
      clienteId: dto.clienteId,
      tipo: TipoMovimientoPunto.CANJEADO,
      puntos: -dto.puntosUsados,
      canjeId: canjeGuardado.id,
      valorCanje: valorSoles,
      descripcion: dto.descripcion || `Canje de ${dto.puntosUsados} puntos por S/ ${valorSoles}`,
    }, usuarioId);

    return { canje: canjeGuardado, movimiento };
  }

  async ajustarPuntos(
    dto: AjustarPuntosDto,
    usuarioId?: string,
  ): Promise<PuntoMovimiento> {
    const tipo = dto.puntos > 0 
      ? TipoMovimientoPunto.AJUSTE_POSITIVO 
      : TipoMovimientoPunto.AJUSTE_NEGATIVO;

    return await this.crearMovimiento({
      clienteId: dto.clienteId,
      tipo,
      puntos: dto.puntos,
      descripcion: `Ajuste: ${dto.motivo}`,
    }, usuarioId);
  }

  async consultarPuntos(dto: ConsultarPuntosDto): Promise<{
    clienteId: string;
    saldoActual: number;
    puntosVencenProximamente: number;
    ultimoMovimiento?: PuntoMovimiento;
    estadisticas: {
      totalGanados: number;
      totalUsados: number;
      totalVencidos: number;
    };
  }> {
    let clienteId = dto.clienteId;

    // Si no se proporciona clienteId, buscar por documento o teléfono
    if (!clienteId) {
      // Aquí deberías implementar la búsqueda del cliente
      // por documento o teléfono usando el servicio de clientes
      throw new BadRequestException('Debe proporcionar clienteId, documento o teléfono');
    }

    const saldoActual = await this.obtenerSaldoCliente(clienteId);
    const puntosVencenProximamente = await this.obtenerPuntosProximosAVencer(clienteId);
    
    const ultimoMovimiento = await this.puntoMovimientoRepository.findOne({
      where: { clienteId },
      order: { createdAt: 'DESC' },
    });

    const estadisticas = await this.obtenerEstadisticasCliente(clienteId);

    return {
      clienteId,
      saldoActual,
      puntosVencenProximamente,
      ultimoMovimiento,
      estadisticas,
    };
  }

  async obtenerHistorialCliente(
    clienteId: string,
    paginationDto: PaginationDto,
  ): Promise<{
    data: PuntoMovimiento[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [movimientos, total] = await this.puntoMovimientoRepository.findAndCount({
      where: { clienteId },
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: movimientos,
      total,
      page,
      limit,
    };
  }

  async obtenerCanjesCliente(
    clienteId: string,
    paginationDto: PaginationDto,
  ): Promise<{
    data: PuntoCanje[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [canjes, total] = await this.puntoCanjeRepository.findAndCount({
      where: { clienteId, esRevertido: false },
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: canjes,
      total,
      page,
      limit,
    };
  }

  async revertirCanje(canjeId: string, motivo: string, usuarioId?: string): Promise<{
    canje: PuntoCanje;
    movimiento: PuntoMovimiento;
  }> {
    const canje = await this.puntoCanjeRepository.findOne({
      where: { id: canjeId },
    });

    if (!canje) {
      throw new NotFoundException('Canje no encontrado');
    }

    if (!canje.puedeRevertirse) {
      throw new BadRequestException('Este canje no puede ser revertido');
    }

    // Revertir el canje
    canje.revertir(usuarioId, motivo);
    const canjeActualizado = await this.puntoCanjeRepository.save(canje);

    // Crear movimiento de devolución de puntos
    const movimiento = await this.crearMovimiento({
      clienteId: canje.clienteId,
      tipo: TipoMovimientoPunto.DEVOLUCION,
      puntos: canje.puntosUsados,
      canjeId: canje.id,
      descripcion: `Devolución por reversión de canje: ${motivo}`,
    }, usuarioId);

    return { canje: canjeActualizado, movimiento };
  }

  async procesarVencimientos(): Promise<{
    puntosVencidos: number;
    clientesAfectados: number;
  }> {
    const ahora = new Date();
    
    const puntosVencidos = await this.puntoMovimientoRepository.find({
      where: {
        fechaVencimiento: Between(new Date('1900-01-01'), ahora),
        esVencido: false,
        estado: EstadoPunto.ACTIVO,
      },
    });

    let totalPuntosVencidos = 0;
    const clientesAfectados = new Set<string>();

    for (const punto of puntosVencidos) {
      punto.verificarVencimiento();
      await this.puntoMovimientoRepository.save(punto);
      
      // Crear movimiento de vencimiento
      await this.crearMovimiento({
        clienteId: punto.clienteId,
        tipo: TipoMovimientoPunto.VENCIDO,
        puntos: -punto.puntosAbsolutos,
        descripcion: `Vencimiento de puntos del ${punto.createdAt.toLocaleDateString()}`,
      });

      totalPuntosVencidos += punto.puntosAbsolutos;
      clientesAfectados.add(punto.clienteId);
    }

    return {
      puntosVencidos: totalPuntosVencidos,
      clientesAfectados: clientesAfectados.size,
    };
  }

  async getEstadisticas(): Promise<{
    totalPuntosCirculacion: number;
    totalPuntosOtorgados: number;
    totalPuntosCanjeados: number;
    totalPuntosVencidos: number;
    clientesConPuntos: number;
    canjesHoy: number;
    valorTotalCanjes: number;
  }> {
    const movimientos = await this.puntoMovimientoRepository.find();
    
    let totalOtorgados = 0;
    let totalCanjeados = 0;
    let totalVencidos = 0;
    const clientesConPuntos = new Set<string>();

    for (const mov of movimientos) {
      if (mov.tipo === TipoMovimientoPunto.GANADO) {
        totalOtorgados += mov.puntosAbsolutos;
      } else if (mov.tipo === TipoMovimientoPunto.CANJEADO) {
        totalCanjeados += mov.puntosAbsolutos;
      } else if (mov.tipo === TipoMovimientoPunto.VENCIDO) {
        totalVencidos += mov.puntosAbsolutos;
      }
      
      if (mov.saldoNuevo > 0) {
        clientesConPuntos.add(mov.clienteId);
      }
    }

    const totalCirculacion = totalOtorgados - totalCanjeados - totalVencidos;

    // Canjes de hoy
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    const canjesHoy = await this.puntoCanjeRepository.count({
      where: {
        fechaCanje: Between(hoy, manana),
        esRevertido: false,
      },
    });

    const canjesHoyData = await this.puntoCanjeRepository.find({
      where: {
        fechaCanje: Between(hoy, manana),
        esRevertido: false,
      },
    });

    const valorTotalCanjes = canjesHoyData.reduce((sum, c) => sum + Number(c.valorSoles), 0);

    return {
      totalPuntosCirculacion: totalCirculacion,
      totalPuntosOtorgados: totalOtorgados,
      totalPuntosCanjeados: totalCanjeados,
      totalPuntosVencidos: totalVencidos,
      clientesConPuntos: clientesConPuntos.size,
      canjesHoy,
      valorTotalCanjes,
    };
  }

  // Métodos privados de utilidad
  private async obtenerSaldoCliente(clienteId: string): Promise<number> {
    const ultimoMovimiento = await this.puntoMovimientoRepository.findOne({
      where: { clienteId },
      order: { createdAt: 'DESC' },
    });

    return ultimoMovimiento?.saldoNuevo || 0;
  }

  private async calcularFechaVencimiento(): Promise<Date> {
    const configuracion = await this.obtenerConfiguracion('dias_vencimiento');
    const diasVencimiento = configuracion?.valorNumerico || 365;
    
    const fechaVencimiento = new Date();
    fechaVencimiento.setDate(fechaVencimiento.getDate() + diasVencimiento);
    
    return fechaVencimiento;
  }

  private async calcularValorCanje(puntos: number): Promise<number> {
    const configuracion = await this.obtenerConfiguracion('punto_valor_soles');
    const valorPorPunto = configuracion?.valorNumerico || 0.10;
    
    return puntos * valorPorPunto;
  }

  private async obtenerConfiguracion(clave: string): Promise<PuntoConfiguracion | null> {
    return await this.puntoConfiguracionRepository.findOne({
      where: { clave, esActivo: true },
    });
  }

  private async obtenerPuntosProximosAVencer(clienteId: string, dias: number = 30): Promise<number> {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + dias);

    const puntosProximos = await this.puntoMovimientoRepository.find({
      where: {
        clienteId,
        fechaVencimiento: Between(new Date(), fechaLimite),
        esVencido: false,
        estado: EstadoPunto.ACTIVO,
      },
    });

    return puntosProximos.reduce((sum, p) => sum + p.puntosAbsolutos, 0);
  }

  private async obtenerEstadisticasCliente(clienteId: string): Promise<{
    totalGanados: number;
    totalUsados: number;
    totalVencidos: number;
  }> {
    const movimientos = await this.puntoMovimientoRepository.find({
      where: { clienteId },
    });

    let totalGanados = 0;
    let totalUsados = 0;
    let totalVencidos = 0;

    for (const mov of movimientos) {
      if (mov.tipo === TipoMovimientoPunto.GANADO) {
        totalGanados += mov.puntosAbsolutos;
      } else if (mov.tipo === TipoMovimientoPunto.CANJEADO) {
        totalUsados += mov.puntosAbsolutos;
      } else if (mov.tipo === TipoMovimientoPunto.VENCIDO) {
        totalVencidos += mov.puntosAbsolutos;
      }
    }

    return { totalGanados, totalUsados, totalVencidos };
  }
}

