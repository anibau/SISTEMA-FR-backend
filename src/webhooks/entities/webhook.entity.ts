import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

export enum EventoWebhook {
  VENTA_REALIZADA = 'venta_realizada',
  CLIENTE_REGISTRADO = 'cliente_registrado',
  PRODUCTO_STOCK_BAJO = 'producto_stock_bajo',
  PRODUCTO_AGOTADO = 'producto_agotado',
  PROMOCION_ACTIVADA = 'promocion_activada',
  DELIVERY_CREADO = 'delivery_creado',
  DELIVERY_ENTREGADO = 'delivery_entregado',
  CIERRE_CAJA_REALIZADO = 'cierre_caja_realizado',
  GASTO_APROBADO = 'gasto_aprobado',
  PUNTOS_CANJEADOS = 'puntos_canjeados',
  CLIENTE_CUMPLEANOS = 'cliente_cumpleanos',
}

export enum EstadoWebhook {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
  ERROR = 'error',
  PAUSADO = 'pausado',
}

export enum MetodoHTTP {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

@Entity('webhooks')
export class Webhook extends BaseEntity {
  @Column()
  nombre: string;

  @Column({ type: 'text' })
  descripcion: string;

  @Column()
  url: string;

  @Column({
    type: 'enum',
    enum: MetodoHTTP,
    default: MetodoHTTP.POST,
  })
  metodo: MetodoHTTP;

  @Column({
    type: 'enum',
    enum: EventoWebhook,
  })
  evento: EventoWebhook;

  @Column({
    type: 'enum',
    enum: EstadoWebhook,
    default: EstadoWebhook.ACTIVO,
  })
  estado: EstadoWebhook;

  // Configuración de headers
  @Column({ type: 'json', nullable: true })
  headers?: {
    [key: string]: string;
  };

  // Configuración de autenticación
  @Column({ nullable: true })
  tipoAuth?: string; // 'bearer', 'basic', 'api_key', 'none'

  @Column({ nullable: true })
  tokenAuth?: string;

  @Column({ nullable: true })
  usuarioAuth?: string;

  @Column({ nullable: true })
  passwordAuth?: string;

  @Column({ nullable: true })
  apiKeyHeader?: string; // Nombre del header para API key

  @Column({ nullable: true })
  apiKeyValue?: string;

  // Configuración de payload
  @Column({ type: 'json', nullable: true })
  payloadTemplate?: {
    [key: string]: any;
  };

  @Column({ default: false })
  incluirMetadatos: boolean;

  @Column({ default: true })
  incluirTimestamp: boolean;

  // Configuración de reintentos
  @Column({ type: 'int', default: 3 })
  maxReintentos: number;

  @Column({ type: 'int', default: 5000 }) // en milisegundos
  timeoutMs: number;

  @Column({ type: 'int', default: 1000 }) // en milisegundos
  delayReintentoMs: number;

  // Filtros de eventos
  @Column({ type: 'json', nullable: true })
  filtros?: {
    condiciones?: {
      campo: string;
      operador: string; // 'equals', 'contains', 'greater_than', etc.
      valor: any;
    }[];
    logica?: 'AND' | 'OR';
  };

  // Estadísticas
  @Column({ type: 'int', default: 0 })
  totalEjecuciones: number;

  @Column({ type: 'int', default: 0 })
  ejecutionesExitosas: number;

  @Column({ type: 'int', default: 0 })
  ejecutionesFallidas: number;

  @Column({ type: 'timestamp', nullable: true })
  ultimaEjecucion?: Date;

  @Column({ type: 'timestamp', nullable: true })
  ultimaEjecucionExitosa?: Date;

  @Column({ type: 'text', nullable: true })
  ultimoError?: string;

  // Información del usuario
  @Column()
  creadoPor: string;

  @Column()
  nombreCreador: string;

  @Column({ type: 'timestamp', nullable: true })
  fechaUltimaModificacion?: Date;

  @Column({ nullable: true })
  modificadoPor?: string;

  // Configuración adicional
  @Column({ default: false })
  esInterno: boolean; // Para webhooks internos del sistema

  @Column({ default: false })
  logearRespuestas: boolean;

  @Column({ default: false })
  notificarErrores: boolean;

  @Column({ nullable: true })
  emailNotificaciones?: string;

  // Métodos de utilidad
  get estaActivo(): boolean {
    return this.estado === EstadoWebhook.ACTIVO;
  }

  get tieneErrores(): boolean {
    return this.estado === EstadoWebhook.ERROR;
  }

  get tasaExito(): number {
    if (this.totalEjecuciones === 0) return 0;
    return (this.ejecutionesExitosas / this.totalEjecuciones) * 100;
  }

  get requiereAuth(): boolean {
    return this.tipoAuth && this.tipoAuth !== 'none';
  }

  activar(): void {
    this.estado = EstadoWebhook.ACTIVO;
  }

  desactivar(): void {
    this.estado = EstadoWebhook.INACTIVO;
  }

  pausar(): void {
    this.estado = EstadoWebhook.PAUSADO;
  }

  marcarError(error: string): void {
    this.estado = EstadoWebhook.ERROR;
    this.ultimoError = error;
    this.ejecutionesFallidas += 1;
    this.totalEjecuciones += 1;
    this.ultimaEjecucion = new Date();
  }

  marcarExito(): void {
    if (this.estado === EstadoWebhook.ERROR) {
      this.estado = EstadoWebhook.ACTIVO;
    }
    this.ultimoError = null;
    this.ejecutionesExitosas += 1;
    this.totalEjecuciones += 1;
    this.ultimaEjecucion = new Date();
    this.ultimaEjecucionExitosa = new Date();
  }

  puedeEjecutar(): boolean {
    return this.estaActivo && this.isActive;
  }

  obtenerHeaders(): { [key: string]: string } {
    const headers: { [key: string]: string } = {
      'Content-Type': 'application/json',
      'User-Agent': 'Francachela-Webhook/1.0',
      ...this.headers,
    };

    // Agregar autenticación
    if (this.requiereAuth) {
      switch (this.tipoAuth) {
        case 'bearer':
          if (this.tokenAuth) {
            headers['Authorization'] = `Bearer ${this.tokenAuth}`;
          }
          break;
        case 'basic':
          if (this.usuarioAuth && this.passwordAuth) {
            const credentials = Buffer.from(`${this.usuarioAuth}:${this.passwordAuth}`).toString('base64');
            headers['Authorization'] = `Basic ${credentials}`;
          }
          break;
        case 'api_key':
          if (this.apiKeyHeader && this.apiKeyValue) {
            headers[this.apiKeyHeader] = this.apiKeyValue;
          }
          break;
      }
    }

    return headers;
  }

  construirPayload(datos: any): any {
    let payload: any = {};

    // Usar template si existe
    if (this.payloadTemplate) {
      payload = { ...this.payloadTemplate };
    }

    // Agregar datos del evento
    payload.evento = this.evento;
    payload.datos = datos;

    // Agregar timestamp si está habilitado
    if (this.incluirTimestamp) {
      payload.timestamp = new Date().toISOString();
    }

    // Agregar metadatos si está habilitado
    if (this.incluirMetadatos) {
      payload.metadatos = {
        webhookId: this.id,
        webhookNombre: this.nombre,
        version: '1.0',
        origen: 'Francachela-POS',
      };
    }

    return payload;
  }

  cumpleFiltros(datos: any): boolean {
    if (!this.filtros || !this.filtros.condiciones || this.filtros.condiciones.length === 0) {
      return true;
    }

    const resultados = this.filtros.condiciones.map(condicion => {
      const valor = this.obtenerValorAnidado(datos, condicion.campo);
      return this.evaluarCondicion(valor, condicion.operador, condicion.valor);
    });

    // Aplicar lógica AND/OR
    if (this.filtros.logica === 'OR') {
      return resultados.some(resultado => resultado);
    } else {
      return resultados.every(resultado => resultado);
    }
  }

  private obtenerValorAnidado(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private evaluarCondicion(valor: any, operador: string, valorEsperado: any): boolean {
    switch (operador) {
      case 'equals':
        return valor === valorEsperado;
      case 'not_equals':
        return valor !== valorEsperado;
      case 'contains':
        return typeof valor === 'string' && valor.includes(valorEsperado);
      case 'not_contains':
        return typeof valor === 'string' && !valor.includes(valorEsperado);
      case 'greater_than':
        return Number(valor) > Number(valorEsperado);
      case 'less_than':
        return Number(valor) < Number(valorEsperado);
      case 'greater_equal':
        return Number(valor) >= Number(valorEsperado);
      case 'less_equal':
        return Number(valor) <= Number(valorEsperado);
      case 'exists':
        return valor !== undefined && valor !== null;
      case 'not_exists':
        return valor === undefined || valor === null;
      case 'in_array':
        return Array.isArray(valorEsperado) && valorEsperado.includes(valor);
      case 'not_in_array':
        return Array.isArray(valorEsperado) && !valorEsperado.includes(valor);
      default:
        return false;
    }
  }
}

