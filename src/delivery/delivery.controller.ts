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
import { DeliveryService } from './delivery.service';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';
import {
  UpdateEstadoDeliveryDto,
  CancelarDeliveryDto,
  CalificarDeliveryDto,
  AgregarContactoDto,
} from './dto/create-delivery.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, UserRole } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { EstadoDelivery } from './entities/delivery.entity';

@ApiTags('Delivery')
@Controller('delivery')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Post()
  @Roles(UserRole.ADMINISTRADOR, UserRole.VENDEDOR)
  @ApiOperation({ 
    summary: 'Crear delivery',
    description: 'Crea un nuevo pedido de delivery'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Delivery creado exitosamente'
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Ya existe un delivery para esta venta'
  })
  create(@Body() createDeliveryDto: CreateDeliveryDto) {
    return this.deliveryService.create(createDeliveryDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Listar deliveries',
    description: 'Obtiene una lista paginada de deliveries'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de deliveries obtenida exitosamente'
  })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.deliveryService.findAll(paginationDto);
  }

  @Get('pendientes')
  @ApiOperation({ 
    summary: 'Deliveries pendientes',
    description: 'Obtiene todos los deliveries pendientes de confirmación'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Deliveries pendientes obtenidos exitosamente'
  })
  findPendientes() {
    return this.deliveryService.findPendientes();
  }

  @Get('en-camino')
  @ApiOperation({ 
    summary: 'Deliveries en camino',
    description: 'Obtiene todos los deliveries que están en camino'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Deliveries en camino obtenidos exitosamente'
  })
  findEnCamino() {
    return this.deliveryService.findEnCamino();
  }

  @Get('atrasados')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Deliveries atrasados',
    description: 'Obtiene deliveries que han superado su tiempo estimado de entrega'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Deliveries atrasados obtenidos exitosamente'
  })
  findAtrasados() {
    return this.deliveryService.obtenerDeliveriesAtrasados();
  }

  @Get('hoy')
  @ApiOperation({ 
    summary: 'Deliveries de hoy',
    description: 'Obtiene todos los deliveries del día actual'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Deliveries de hoy obtenidos exitosamente'
  })
  findHoy() {
    return this.deliveryService.obtenerDeliveriesHoy();
  }

  @Get('repartidor/:repartidorId')
  @ApiOperation({ 
    summary: 'Deliveries por repartidor',
    description: 'Obtiene deliveries asignados a un repartidor específico'
  })
  @ApiParam({ name: 'repartidorId', description: 'ID del repartidor' })
  @ApiResponse({ 
    status: 200, 
    description: 'Deliveries del repartidor obtenidos exitosamente'
  })
  findByRepartidor(@Param('repartidorId') repartidorId: string) {
    return this.deliveryService.findByRepartidor(repartidorId);
  }

  @Get('cliente/:clienteId')
  @ApiOperation({ 
    summary: 'Deliveries por cliente',
    description: 'Obtiene el historial de deliveries de un cliente'
  })
  @ApiParam({ name: 'clienteId', description: 'ID del cliente' })
  @ApiResponse({ 
    status: 200, 
    description: 'Deliveries del cliente obtenidos exitosamente'
  })
  findByCliente(
    @Param('clienteId') clienteId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.deliveryService.findByCliente(clienteId, paginationDto);
  }

  @Get('estado/:estado')
  @ApiOperation({ 
    summary: 'Deliveries por estado',
    description: 'Obtiene deliveries filtrados por estado'
  })
  @ApiParam({ 
    name: 'estado', 
    enum: EstadoDelivery,
    description: 'Estado del delivery' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Deliveries por estado obtenidos exitosamente'
  })
  findByEstado(@Param('estado') estado: EstadoDelivery) {
    return this.deliveryService.findByEstado(estado);
  }

  @Get('estadisticas')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Estadísticas de delivery',
    description: 'Obtiene estadísticas generales del sistema de delivery'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estadísticas obtenidas exitosamente',
    schema: {
      type: 'object',
      properties: {
        totalDeliveries: { type: 'number', example: 150 },
        deliveriesHoy: { type: 'number', example: 12 },
        pendientes: { type: 'number', example: 5 },
        enCamino: { type: 'number', example: 8 },
        entregados: { type: 'number', example: 120 },
        cancelados: { type: 'number', example: 17 },
        atrasados: { type: 'number', example: 3 },
        tiempoPromedioEntrega: { type: 'number', example: 45 },
        calificacionPromedio: { type: 'number', example: 4.2 },
        ingresosTotalDelivery: { type: 'number', example: 750.00 },
      }
    }
  })
  getEstadisticas() {
    return this.deliveryService.getEstadisticas();
  }

  @Get('numero/:numeroPedido')
  @Public()
  @ApiOperation({ 
    summary: 'Buscar por número de pedido',
    description: 'Obtiene un delivery por su número de pedido (público para seguimiento)'
  })
  @ApiParam({ name: 'numeroPedido', description: 'Número del pedido' })
  @ApiResponse({ 
    status: 200, 
    description: 'Delivery encontrado'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Pedido no encontrado'
  })
  findByNumeroPedido(@Param('numeroPedido') numeroPedido: string) {
    return this.deliveryService.findByNumeroPedido(numeroPedido);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Obtener delivery por ID',
    description: 'Obtiene un delivery específico por su ID'
  })
  @ApiParam({ name: 'id', description: 'ID del delivery' })
  @ApiResponse({ 
    status: 200, 
    description: 'Delivery encontrado'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Delivery no encontrado'
  })
  findOne(@Param('id') id: string) {
    return this.deliveryService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMINISTRADOR, UserRole.VENDEDOR)
  @ApiOperation({ 
    summary: 'Actualizar delivery',
    description: 'Actualiza un delivery (solo si está pendiente o confirmado)'
  })
  @ApiParam({ name: 'id', description: 'ID del delivery' })
  @ApiResponse({ 
    status: 200, 
    description: 'Delivery actualizado exitosamente'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'El delivery no puede ser modificado'
  })
  update(@Param('id') id: string, @Body() updateDeliveryDto: UpdateDeliveryDto) {
    return this.deliveryService.update(id, updateDeliveryDto);
  }

  @Patch(':id/confirmar')
  @Roles(UserRole.ADMINISTRADOR, UserRole.VENDEDOR)
  @ApiOperation({ 
    summary: 'Confirmar delivery',
    description: 'Confirma un delivery pendiente'
  })
  @ApiParam({ name: 'id', description: 'ID del delivery' })
  @ApiResponse({ 
    status: 200, 
    description: 'Delivery confirmado exitosamente'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Solo se pueden confirmar deliveries pendientes'
  })
  confirmar(
    @Param('id') id: string,
    @Body() updateDto?: UpdateEstadoDeliveryDto,
  ) {
    return this.deliveryService.confirmar(id, updateDto);
  }

  @Patch(':id/preparar')
  @Roles(UserRole.ADMINISTRADOR, UserRole.VENDEDOR)
  @ApiOperation({ 
    summary: 'Iniciar preparación',
    description: 'Inicia la preparación de un delivery confirmado'
  })
  @ApiParam({ name: 'id', description: 'ID del delivery' })
  @ApiResponse({ 
    status: 200, 
    description: 'Preparación iniciada exitosamente'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Solo se pueden preparar deliveries confirmados'
  })
  iniciarPreparacion(
    @Param('id') id: string,
    @Body() updateDto?: UpdateEstadoDeliveryDto,
  ) {
    return this.deliveryService.iniciarPreparacion(id, updateDto);
  }

  @Patch(':id/enviar')
  @Roles(UserRole.ADMINISTRADOR, UserRole.VENDEDOR)
  @ApiOperation({ 
    summary: 'Enviar delivery',
    description: 'Marca un delivery como enviado (en camino)'
  })
  @ApiParam({ name: 'id', description: 'ID del delivery' })
  @ApiResponse({ 
    status: 200, 
    description: 'Delivery enviado exitosamente'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Solo se pueden enviar deliveries que están siendo preparados'
  })
  enviar(
    @Param('id') id: string,
    @Body() updateDto?: UpdateEstadoDeliveryDto,
  ) {
    return this.deliveryService.enviar(id, updateDto);
  }

  @Patch(':id/entregar')
  @Roles(UserRole.ADMINISTRADOR, UserRole.VENDEDOR)
  @ApiOperation({ 
    summary: 'Entregar delivery',
    description: 'Marca un delivery como entregado'
  })
  @ApiParam({ name: 'id', description: 'ID del delivery' })
  @ApiResponse({ 
    status: 200, 
    description: 'Delivery entregado exitosamente'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Solo se pueden entregar deliveries en camino'
  })
  entregar(
    @Param('id') id: string,
    @Body() updateDto?: UpdateEstadoDeliveryDto,
  ) {
    return this.deliveryService.entregar(id, updateDto);
  }

  @Patch(':id/cancelar')
  @Roles(UserRole.ADMINISTRADOR, UserRole.VENDEDOR)
  @ApiOperation({ 
    summary: 'Cancelar delivery',
    description: 'Cancela un delivery con motivo'
  })
  @ApiParam({ name: 'id', description: 'ID del delivery' })
  @ApiResponse({ 
    status: 200, 
    description: 'Delivery cancelado exitosamente'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Este delivery no puede ser cancelado'
  })
  cancelar(@Param('id') id: string, @Body() cancelarDto: CancelarDeliveryDto) {
    return this.deliveryService.cancelar(id, cancelarDto);
  }

  @Patch(':id/asignar-repartidor')
  @Roles(UserRole.ADMINISTRADOR, UserRole.VENDEDOR)
  @ApiOperation({ 
    summary: 'Asignar repartidor',
    description: 'Asigna un repartidor a un delivery'
  })
  @ApiParam({ name: 'id', description: 'ID del delivery' })
  @ApiResponse({ 
    status: 200, 
    description: 'Repartidor asignado exitosamente'
  })
  asignarRepartidor(
    @Param('id') id: string,
    @Body() body: { repartidorId: string; repartidorNombre?: string },
  ) {
    return this.deliveryService.asignarRepartidor(
      id,
      body.repartidorId,
      body.repartidorNombre,
    );
  }

  @Post(':id/contacto')
  @Roles(UserRole.ADMINISTRADOR, UserRole.VENDEDOR)
  @ApiOperation({ 
    summary: 'Agregar contacto',
    description: 'Registra un intento de contacto con el cliente'
  })
  @ApiParam({ name: 'id', description: 'ID del delivery' })
  @ApiResponse({ 
    status: 200, 
    description: 'Contacto registrado exitosamente'
  })
  agregarContacto(@Param('id') id: string, @Body() contactoDto: AgregarContactoDto) {
    return this.deliveryService.agregarContacto(id, contactoDto);
  }

  @Post(':id/calificar')
  @Public()
  @ApiOperation({ 
    summary: 'Calificar delivery',
    description: 'Permite al cliente calificar el servicio de delivery (público)'
  })
  @ApiParam({ name: 'id', description: 'ID del delivery' })
  @ApiResponse({ 
    status: 200, 
    description: 'Calificación registrada exitosamente'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Este delivery no puede ser calificado'
  })
  calificar(@Param('id') id: string, @Body() calificarDto: CalificarDeliveryDto) {
    return this.deliveryService.calificar(id, calificarDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ 
    summary: 'Eliminar delivery',
    description: 'Elimina (desactiva) un delivery (solo administradores)'
  })
  @ApiParam({ name: 'id', description: 'ID del delivery' })
  @ApiResponse({ 
    status: 200, 
    description: 'Delivery eliminado exitosamente'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Este delivery no puede ser eliminado'
  })
  remove(@Param('id') id: string) {
    return this.deliveryService.remove(id);
  }
}

