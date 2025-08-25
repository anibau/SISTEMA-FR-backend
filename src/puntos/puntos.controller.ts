import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
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
import { PuntosService } from './puntos.service';
import {
  CrearMovimientoPuntoDto,
  CanjearPuntosDto,
  AjustarPuntosDto,
  ConsultarPuntosDto,
} from './dto/crear-movimiento.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, UserRole } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Puntos')
@Controller('puntos')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class PuntosController {
  constructor(private readonly puntosService: PuntosService) {}

  @Post('movimiento')
  @Roles(UserRole.ADMINISTRADOR, UserRole.VENDEDOR)
  @ApiOperation({ 
    summary: 'Crear movimiento de puntos',
    description: 'Crea un movimiento de puntos (ganado, usado, ajuste, etc.)'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Movimiento creado exitosamente'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Puntos insuficientes o datos inválidos'
  })
  crearMovimiento(
    @Body() dto: CrearMovimientoPuntoDto,
    @CurrentUser() user: any,
  ) {
    return this.puntosService.crearMovimiento(dto, user.id);
  }

  @Post('otorgar-por-compra')
  @Roles(UserRole.ADMINISTRADOR, UserRole.VENDEDOR)
  @ApiOperation({ 
    summary: 'Otorgar puntos por compra',
    description: 'Calcula y otorga puntos automáticamente basado en el monto de compra'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Puntos otorgados exitosamente'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'El monto no genera puntos'
  })
  otorgarPuntosPorCompra(
    @Body() body: {
      clienteId: string;
      montoCompra: number;
      ventaId: string;
    },
    @CurrentUser() user: any,
  ) {
    return this.puntosService.otorgarPuntosPorCompra(
      body.clienteId,
      body.montoCompra,
      body.ventaId,
      user.id,
    );
  }

  @Post('calcular-por-compra')
  @ApiOperation({ 
    summary: 'Calcular puntos por monto',
    description: 'Calcula cuántos puntos se generarían por un monto de compra'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Cálculo realizado exitosamente',
    schema: {
      type: 'object',
      properties: {
        montoCompra: { type: 'number', example: 100.50 },
        puntosGanados: { type: 'number', example: 10 },
        configuracion: {
          type: 'object',
          properties: {
            solesPorPunto: { type: 'number', example: 10 },
          }
        }
      }
    }
  })
  calcularPuntosPorCompra(@Body() body: { montoCompra: number }) {
    return this.puntosService.calcularPuntosPorCompra(body.montoCompra);
  }

  @Post('canjear')
  @Roles(UserRole.ADMINISTRADOR, UserRole.VENDEDOR)
  @ApiOperation({ 
    summary: 'Canjear puntos',
    description: 'Permite canjear puntos por descuentos o productos'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Canje realizado exitosamente'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Puntos insuficientes o mínimo no alcanzado'
  })
  canjearPuntos(
    @Body() dto: CanjearPuntosDto,
    @CurrentUser() user: any,
  ) {
    return this.puntosService.canjearPuntos(dto, user.id);
  }

  @Post('ajustar')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Ajustar puntos',
    description: 'Permite ajustar puntos manualmente (solo administradores)'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Ajuste realizado exitosamente'
  })
  ajustarPuntos(
    @Body() dto: AjustarPuntosDto,
    @CurrentUser() user: any,
  ) {
    return this.puntosService.ajustarPuntos(dto, user.id);
  }

  @Post('consultar')
  @ApiOperation({ 
    summary: 'Consultar puntos de cliente',
    description: 'Consulta el saldo y estadísticas de puntos de un cliente'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Consulta realizada exitosamente',
    schema: {
      type: 'object',
      properties: {
        clienteId: { type: 'string', example: 'uuid-cliente-1' },
        saldoActual: { type: 'number', example: 250 },
        puntosVencenProximamente: { type: 'number', example: 50 },
        estadisticas: {
          type: 'object',
          properties: {
            totalGanados: { type: 'number', example: 500 },
            totalUsados: { type: 'number', example: 200 },
            totalVencidos: { type: 'number', example: 50 },
          }
        }
      }
    }
  })
  consultarPuntos(@Body() dto: ConsultarPuntosDto) {
    return this.puntosService.consultarPuntos(dto);
  }

  @Get('historial/:clienteId')
  @ApiOperation({ 
    summary: 'Historial de puntos de cliente',
    description: 'Obtiene el historial paginado de movimientos de puntos de un cliente'
  })
  @ApiParam({ name: 'clienteId', description: 'ID del cliente' })
  @ApiResponse({ 
    status: 200, 
    description: 'Historial obtenido exitosamente'
  })
  obtenerHistorialCliente(
    @Param('clienteId') clienteId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.puntosService.obtenerHistorialCliente(clienteId, paginationDto);
  }

  @Get('canjes/:clienteId')
  @ApiOperation({ 
    summary: 'Canjes de cliente',
    description: 'Obtiene el historial paginado de canjes de un cliente'
  })
  @ApiParam({ name: 'clienteId', description: 'ID del cliente' })
  @ApiResponse({ 
    status: 200, 
    description: 'Canjes obtenidos exitosamente'
  })
  obtenerCanjesCliente(
    @Param('clienteId') clienteId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.puntosService.obtenerCanjesCliente(clienteId, paginationDto);
  }

  @Patch('canje/:canjeId/revertir')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Revertir canje',
    description: 'Revierte un canje de puntos (solo administradores, dentro de 24h)'
  })
  @ApiParam({ name: 'canjeId', description: 'ID del canje' })
  @ApiResponse({ 
    status: 200, 
    description: 'Canje revertido exitosamente'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'El canje no puede ser revertido'
  })
  revertirCanje(
    @Param('canjeId') canjeId: string,
    @Body() body: { motivo: string },
    @CurrentUser() user: any,
  ) {
    return this.puntosService.revertirCanje(canjeId, body.motivo, user.id);
  }

  @Post('procesar-vencimientos')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Procesar vencimientos',
    description: 'Procesa automáticamente los puntos vencidos (solo administradores)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Vencimientos procesados exitosamente',
    schema: {
      type: 'object',
      properties: {
        puntosVencidos: { type: 'number', example: 150 },
        clientesAfectados: { type: 'number', example: 8 },
      }
    }
  })
  procesarVencimientos() {
    return this.puntosService.procesarVencimientos();
  }

  @Get('estadisticas')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Estadísticas del sistema de puntos',
    description: 'Obtiene estadísticas generales del sistema de puntos (solo administradores)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estadísticas obtenidas exitosamente',
    schema: {
      type: 'object',
      properties: {
        totalPuntosCirculacion: { type: 'number', example: 15000 },
        totalPuntosOtorgados: { type: 'number', example: 25000 },
        totalPuntosCanjeados: { type: 'number', example: 8000 },
        totalPuntosVencidos: { type: 'number', example: 2000 },
        clientesConPuntos: { type: 'number', example: 150 },
        canjesHoy: { type: 'number', example: 12 },
        valorTotalCanjes: { type: 'number', example: 120.50 },
      }
    }
  })
  getEstadisticas() {
    return this.puntosService.getEstadisticas();
  }
}

