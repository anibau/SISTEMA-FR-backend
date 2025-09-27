import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../auth/entities/user.entity';

export enum TipoAccion {
  CREAR = 'crear',
  ACTUALIZAR = 'actualizar',
  ELIMINAR = 'eliminar',
  ACCESO = 'acceso',
  LOGIN = 'login',
  LOGOUT = 'logout',
  CAMBIO_PASSWORD = 'cambio_password',
  ACCESO_DENEGADO = 'acceso_denegado',
  EXPORTAR = 'exportar',
  IMPORTAR = 'importar',
  BACKUP = 'backup',
  RESTAURAR = 'restaurar',
}

export enum TipoEntidad {
  USUARIO = 'usuario',
  PRODUCTO = 'producto',
  VENTA = 'venta',
  CLIENTE = 'cliente',
  COMBO = 'combo',
  PROMOCION = 'promocion',
  CIERRE_CAJA = 'cierre_caja',
  GASTO = 'gasto',
  CONFIGURACION = 'configuracion',
}

@Entity('auditoria')
@Index(['entidad', 'entidadId'])
@Index(['usuarioId', 'createdAt'])
@Index(['accion', 'createdAt'])
export class Auditoria extends BaseEntity {
  // Información de la acción
  @Column({
    type: 'enum',
    enum: TipoAccion,
  })
  accion: TipoAccion;

  @Column({
    type: 'enum',
    enum: TipoEntidad,
  })
  entidad: TipoEntidad;

  @Column({ nullable: true })
  entidadId?: string; // ID del registro afectado

  // Información del usuario
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'usuario_id' })
  usuario?: User;

  @Column({ name: 'usuario_id', nullable: true })
  usuarioId?: string;

  @Column({ nullable: true })
  descripcion?: string;

  // Información de la sesión
  @Column({ nullable: true })
  ip?: string;

  @Column({ nullable: true })
  userAgent?: string;

  // Información del cambio
  @Column({ type: 'json', nullable: true })
  valoresAnteriores?: { [key: string]: any };

  @Column({ type: 'json', nullable: true })
  valoresNuevos?: { [key: string]: any };

  @Column({ type: 'json', nullable: true })
  metadatos?: { [key: string]: any };
}

