import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Webhook } from './webhook.entity';

export enum EstadoEjecucion {
  PENDIENTE = 'pendiente',
  EJECUTANDO = 'ejecutando',
  EXITOSO = 'exitoso',
  FALLIDO = 'fallido',
  TIMEOUT = 'timeout',
  CANCELADO = 'cancelado',
}

@Entity('webhook_logs')
export class WebhookLog extends BaseEntity {
  @Column()
  webhookId: string;

  @Column({
    type: 'enum',
    enum: EstadoEjecucion,
    default: EstadoEjecucion.PENDIENTE,
  })
  estado: EstadoEjecucion;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaEjecucion: Date;

  @Column({ type: 'timestamp', nullable: true })
  fechaCompletado?: Date;

  @Column({ type: 'int', nullable: true })
  duracionMs?: number;

  // Datos del request
  @Column()
  url: string;

  @Column()
  metodo: string;

  @Column({ type: 'json', nullable: true })
  headers?: { [key: string]: string };

  @Column({ type: 'json', nullable: true })
  payload?: any;

  // Datos de la respuesta
  @Column({ type: 'int', nullable: true })
  statusCode?: number;

  @Column({ type: 'json', nullable: true })
  responseHeaders?: { [key: string]: string };

  @Column({ type: 'text', nullable: true })
  responseBody?: string;

  // Información de error
  @Column({ type: 'text', nullable: true })
  mensajeError?: string;

  @Column({ type: 'text', nullable: true })
  stackTrace?: string;

  // Información de reintentos
  @Column({ type: 'int', default: 0 })
  numeroIntento: number;

  @Column({ type: 'int', default: 0 })
  maxIntentos: number;

  @Column({ type: 'timestamp', nullable: true })
  proximoIntento?: Date;

  // Información del evento que disparó el webhook
  @Column()
  eventoTipo: string;

  @Column({ nullable: true })
  eventoId?: string; // ID del objeto que disparó el evento

  @Column({ type: 'json', nullable: true })
  eventoData?: any;

  // Relaciones
  @ManyToOne(() => Webhook, webhook => webhook.id)
  @JoinColumn({ name: 'webhookId' })
  webhook: Webhook;

  // Métodos de utilidad
  get esExitoso(): boolean {
    return this.estado === EstadoEjecucion.EXITOSO;
  }

  get esFallido(): boolean {
    return [EstadoEjecucion.FALLIDO, EstadoEjecucion.TIMEOUT].includes(this.estado);
  }

  get puedeReintentar(): boolean {
    return this.esFallido && this.numeroIntento < this.maxIntentos;
  }

  get tiempoTranscurrido(): number {
    if (!this.fechaCompletado) {
      return Date.now() - this.fechaEjecucion.getTime();
    }
    return this.fechaCompletado.getTime() - this.fechaEjecucion.getTime();
  }

  marcarComoEjecutando(): void {
    this.estado = EstadoEjecucion.EJECUTANDO;
    this.fechaEjecucion = new Date();
  }

  marcarComoExitoso(statusCode: number, responseHeaders?: any, responseBody?: string): void {
    this.estado = EstadoEjecucion.EXITOSO;
    this.fechaCompletado = new Date();
    this.duracionMs = this.tiempoTranscurrido;
    this.statusCode = statusCode;
    this.responseHeaders = responseHeaders;
    this.responseBody = responseBody;
  }

  marcarComoFallido(error: string, statusCode?: number, responseHeaders?: any, responseBody?: string): void {
    this.estado = EstadoEjecucion.FALLIDO;
    this.fechaCompletado = new Date();
    this.duracionMs = this.tiempoTranscurrido;
    this.mensajeError = error;
    this.statusCode = statusCode;
    this.responseHeaders = responseHeaders;
    this.responseBody = responseBody;
  }

  marcarComoTimeout(): void {
    this.estado = EstadoEjecucion.TIMEOUT;
    this.fechaCompletado = new Date();
    this.duracionMs = this.tiempoTranscurrido;
    this.mensajeError = 'Timeout en la ejecución del webhook';
  }

  programarReintento(delayMs: number): void {
    this.numeroIntento += 1;
    this.proximoIntento = new Date(Date.now() + delayMs);
    this.estado = EstadoEjecucion.PENDIENTE;
  }

  cancelar(): void {
    this.estado = EstadoEjecucion.CANCELADO;
    this.fechaCompletado = new Date();
    this.duracionMs = this.tiempoTranscurrido;
  }
}

