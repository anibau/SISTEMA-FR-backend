import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

export enum TipoConfiguracion {
  SISTEMA = 'sistema',
  PUNTOS = 'puntos',
  PROMOCIONES = 'promociones',
  DELIVERY = 'delivery',
  NOTIFICACIONES = 'notificaciones',
  PAGOS = 'pagos',
  IMPUESTOS = 'impuestos',
}

@Entity('configuraciones')
export class Configuracion extends BaseEntity {
  @Column({ unique: true })
  clave: string;

  @Column()
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @Column({ type: 'json' })
  valor: any;

  @Column({
    type: 'enum',
    enum: TipoConfiguracion,
    default: TipoConfiguracion.SISTEMA,
  })
  tipo: TipoConfiguracion;

  @Column({ type: 'json', nullable: true })
  opciones?: {
    min?: number;
    max?: number;
    opciones?: string[];
    requerido?: boolean;
    formato?: string;
  };

  @Column({ default: true })
  esEditable: boolean;

  @Column({ default: false })
  requiereReinicio: boolean;

  @Column({ nullable: true })
  modificadoPor?: string;

  @Column({ type: 'timestamp', nullable: true })
  fechaModificacion?: Date;

  // Métodos de utilidad
  get valorString(): string {
    return typeof this.valor === 'string' ? this.valor : JSON.stringify(this.valor);
  }

  get valorNumber(): number {
    return typeof this.valor === 'number' ? this.valor : parseFloat(this.valor);
  }

  get valorBoolean(): boolean {
    return typeof this.valor === 'boolean' ? this.valor : this.valor === 'true';
  }

  get valorObject(): any {
    return typeof this.valor === 'object' ? this.valor : JSON.parse(this.valor);
  }

  actualizarValor(nuevoValor: any, usuarioId?: string): void {
    this.valor = nuevoValor;
    this.modificadoPor = usuarioId;
    this.fechaModificacion = new Date();
  }

  validarValor(valor: any): boolean {
    if (!this.opciones) return true;

    if (this.opciones.requerido && (valor === null || valor === undefined)) {
      return false;
    }

    if (typeof valor === 'number') {
      if (this.opciones.min !== undefined && valor < this.opciones.min) return false;
      if (this.opciones.max !== undefined && valor > this.opciones.max) return false;
    }

    if (this.opciones.opciones && !this.opciones.opciones.includes(valor)) {
      return false;
    }

    return true;
  }
}

