import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

export enum TipoNotificacion {
  STOCK_BAJO = 'stock_bajo',
  PRODUCTO_AGOTADO = 'producto_agotado',
  VENTA_REALIZADA = 'venta_realizada',
  CLIENTE_CUMPLEANOS = 'cliente_cumpleanos',
  FIADO_VENCIDO = 'fiado_vencido',
  PROMOCION_ACTIVADA = 'promocion_activada',
  PROMOCION_VENCIDA = 'promocion_vencida',
  CIERRE_CAJA_PENDIENTE = 'cierre_caja_pendiente',
  GASTO_PENDIENTE = 'gasto_pendiente',
  DELIVERY_ATRASADO = 'delivery_atrasado',
  SISTEMA = 'sistema',
  RECORDATORIO = 'recordatorio',
}

export enum PrioridadNotificacion {
  BAJA = 'baja',
  MEDIA = 'media',
  ALTA = 'alta',
  CRITICA = 'critica',
}

export enum EstadoNotificacion {
  PENDIENTE = 'pendiente',
  LEIDA = 'leida',
  ARCHIVADA = 'archivada',
}

@Entity('notificaciones')
export class Notificacion extends BaseEntity {
  @Column({
    type: 'enum',
    enum: TipoNotificacion,
  })
  tipo: TipoNotificacion;

  @Column()
  titulo: string;

  @Column({ type: 'text' })
  mensaje: string;

  @Column({
    type: 'enum',
    enum: PrioridadNotificacion,
    default: PrioridadNotificacion.MEDIA,
  })
  prioridad: PrioridadNotificacion;

  @Column({
    type: 'enum',
    enum: EstadoNotificacion,
    default: EstadoNotificacion.PENDIENTE,
  })
  estado: EstadoNotificacion;

  // Usuario destinatario
  @Column({ nullable: true })
  usuarioId?: string; // Si es null, es para todos los usuarios

  @Column({ nullable: true })
  usuarioNombre?: string;

  @Column({ nullable: true })
  rolDestino?: string; // Para notificaciones dirigidas a un rol específico

  // Información de referencia
  @Column({ nullable: true })
  referenciaId?: string; // ID del objeto relacionado (producto, venta, etc.)

  @Column({ nullable: true })
  referenciaTabla?: string; // Tabla del objeto relacionado

  @Column({ type: 'json', nullable: true })
  metadatos?: {
    productoId?: string;
    productoNombre?: string;
    stockActual?: number;
    stockMinimo?: number;
    ventaId?: string;
    clienteId?: string;
    clienteNombre?: string;
    montoVenta?: number;
    fechaVencimiento?: Date;
    url?: string;
    accion?: string;
    [key: string]: any;
  };

  // Fechas importantes
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaCreacion: Date;

  @Column({ type: 'timestamp', nullable: true })
  fechaLectura?: Date;

  @Column({ type: 'timestamp', nullable: true })
  fechaArchivado?: Date;

  @Column({ type: 'timestamp', nullable: true })
  fechaExpiracion?: Date; // Para notificaciones temporales

  // Configuración de envío
  @Column({ default: false })
  enviadaPorEmail: boolean;

  @Column({ default: false })
  enviadaPorSMS: boolean;

  @Column({ default: false })
  enviadaPorWhatsApp: boolean;

  @Column({ default: false })
  mostrarEnDashboard: boolean;

  @Column({ default: false })
  requiereAccion: boolean;

  @Column({ nullable: true })
  urlAccion?: string; // URL para realizar la acción requerida

  @Column({ nullable: true })
  textoAccion?: string; // Texto del botón de acción

  // Información del remitente (sistema o usuario)
  @Column({ nullable: true })
  creadaPor?: string; // ID del usuario que creó la notificación

  @Column({ default: 'sistema' })
  origen: string; // 'sistema', 'usuario', 'automatico'

  // Relaciones
  // @ManyToOne(() => User, user => user.notificacionesRecibidas)
  // @JoinColumn({ name: 'usuarioId' })
  // usuario: User;

  // @ManyToOne(() => User, user => user.notificacionesCreadas)
  // @JoinColumn({ name: 'creadaPor' })
  // creador: User;

  // Métodos de utilidad
  get esPendiente(): boolean {
    return this.estado === EstadoNotificacion.PENDIENTE;
  }

  get esLeida(): boolean {
    return this.estado === EstadoNotificacion.LEIDA;
  }

  get esArchivada(): boolean {
    return this.estado === EstadoNotificacion.ARCHIVADA;
  }

  get esCritica(): boolean {
    return this.prioridad === PrioridadNotificacion.CRITICA;
  }

  get esAlta(): boolean {
    return this.prioridad === PrioridadNotificacion.ALTA;
  }

  get estaExpirada(): boolean {
    if (!this.fechaExpiracion) return false;
    return new Date() > this.fechaExpiracion;
  }

  get tiempoTranscurrido(): number {
    return Date.now() - this.fechaCreacion.getTime();
  }

  get tiempoTranscurridoTexto(): string {
    const minutos = Math.floor(this.tiempoTranscurrido / (1000 * 60));
    
    if (minutos < 1) return 'Hace un momento';
    if (minutos < 60) return `Hace ${minutos} minuto${minutos > 1 ? 's' : ''}`;
    
    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `Hace ${horas} hora${horas > 1 ? 's' : ''}`;
    
    const dias = Math.floor(horas / 24);
    return `Hace ${dias} día${dias > 1 ? 's' : ''}`;
  }

  marcarComoLeida(): void {
    if (this.estado === EstadoNotificacion.PENDIENTE) {
      this.estado = EstadoNotificacion.LEIDA;
      this.fechaLectura = new Date();
    }
  }

  archivar(): void {
    this.estado = EstadoNotificacion.ARCHIVADA;
    this.fechaArchivado = new Date();
  }

  restaurar(): void {
    if (this.estado === EstadoNotificacion.ARCHIVADA) {
      this.estado = this.fechaLectura ? EstadoNotificacion.LEIDA : EstadoNotificacion.PENDIENTE;
      this.fechaArchivado = null;
    }
  }

  static crearNotificacionStockBajo(productoId: string, productoNombre: string, stockActual: number, stockMinimo: number): Partial<Notificacion> {
    return {
      tipo: TipoNotificacion.STOCK_BAJO,
      titulo: 'Stock Bajo',
      mensaje: `El producto "${productoNombre}" tiene stock bajo (${stockActual} unidades)`,
      prioridad: PrioridadNotificacion.MEDIA,
      referenciaId: productoId,
      referenciaTabla: 'productos',
      mostrarEnDashboard: true,
      requiereAccion: true,
      urlAccion: `/productos/${productoId}`,
      textoAccion: 'Ver Producto',
      metadatos: {
        productoId,
        productoNombre,
        stockActual,
        stockMinimo,
      },
    };
  }

  static crearNotificacionProductoAgotado(productoId: string, productoNombre: string): Partial<Notificacion> {
    return {
      tipo: TipoNotificacion.PRODUCTO_AGOTADO,
      titulo: 'Producto Agotado',
      mensaje: `El producto "${productoNombre}" se ha agotado`,
      prioridad: PrioridadNotificacion.ALTA,
      referenciaId: productoId,
      referenciaTabla: 'productos',
      mostrarEnDashboard: true,
      requiereAccion: true,
      urlAccion: `/productos/${productoId}`,
      textoAccion: 'Reabastecer',
      metadatos: {
        productoId,
        productoNombre,
        stockActual: 0,
      },
    };
  }

  static crearNotificacionVentaRealizada(ventaId: string, monto: number, clienteNombre?: string): Partial<Notificacion> {
    return {
      tipo: TipoNotificacion.VENTA_REALIZADA,
      titulo: 'Nueva Venta',
      mensaje: `Venta realizada por S/ ${monto.toFixed(2)}${clienteNombre ? ` - Cliente: ${clienteNombre}` : ''}`,
      prioridad: PrioridadNotificacion.BAJA,
      referenciaId: ventaId,
      referenciaTabla: 'ventas',
      mostrarEnDashboard: false,
      metadatos: {
        ventaId,
        montoVenta: monto,
        clienteNombre,
      },
    };
  }

  static crearNotificacionCumpleanos(clienteId: string, clienteNombre: string): Partial<Notificacion> {
    return {
      tipo: TipoNotificacion.CLIENTE_CUMPLEANOS,
      titulo: 'Cumpleaños de Cliente',
      mensaje: `Hoy es el cumpleaños de ${clienteNombre}`,
      prioridad: PrioridadNotificacion.MEDIA,
      referenciaId: clienteId,
      referenciaTabla: 'clientes',
      mostrarEnDashboard: true,
      requiereAccion: true,
      urlAccion: `/clientes/${clienteId}`,
      textoAccion: 'Ver Cliente',
      fechaExpiracion: new Date(Date.now() + 24 * 60 * 60 * 1000), // Expira en 24 horas
      metadatos: {
        clienteId,
        clienteNombre,
      },
    };
  }

  static crearNotificacionDeliveryAtrasado(deliveryId: string, numeroPedido: string, clienteNombre: string): Partial<Notificacion> {
    return {
      tipo: TipoNotificacion.DELIVERY_ATRASADO,
      titulo: 'Delivery Atrasado',
      mensaje: `El pedido ${numeroPedido} para ${clienteNombre} está atrasado`,
      prioridad: PrioridadNotificacion.ALTA,
      referenciaId: deliveryId,
      referenciaTabla: 'deliveries',
      mostrarEnDashboard: true,
      requiereAccion: true,
      urlAccion: `/delivery/${deliveryId}`,
      textoAccion: 'Ver Pedido',
      metadatos: {
        deliveryId,
        numeroPedido,
        clienteNombre,
      },
    };
  }
}

