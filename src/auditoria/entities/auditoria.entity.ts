import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

export enum TipoAccion {
  CREAR = 'crear',
  ACTUALIZAR = 'actualizar',
  ELIMINAR = 'eliminar',
  LOGIN = 'login',
  LOGOUT = 'logout',
  CAMBIO_PASSWORD = 'cambio_password',
  ACCESO_DENEGADO = 'acceso_denegado',
  EXPORTAR = 'exportar',
  IMPORTAR = 'importar',
  BACKUP = 'backup',
  RESTAURAR = 'restaurar',
}

export enum NivelSeveridad {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

@Entity('auditoria')
@Index(['tabla', 'registroId'])
@Index(['usuarioId', 'fechaAccion'])
@Index(['accion', 'fechaAccion'])
export class Auditoria extends BaseEntity {
  // Información de la acción
  @Column({
    type: 'enum',
    enum: TipoAccion,
  })
  accion: TipoAccion;

  @Column()
  tabla: string; // Tabla afectada (productos, ventas, usuarios, etc.)

  @Column({ nullable: true })
  registroId?: string; // ID del registro afectado

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fechaAccion: Date;

  // Información del usuario
  @Column({ nullable: true })
  usuarioId?: string;

  @Column({ nullable: true })
  usuarioNombre?: string;

  @Column({ nullable: true })
  usuarioEmail?: string;

  @Column({ nullable: true })
  usuarioRol?: string;

  // Información de la sesión
  @Column({ nullable: true })
  sessionId?: string;

  @Column({ nullable: true })
  ipAddress?: string;

  @Column({ nullable: true })
  userAgent?: string;

  // Información del cambio
  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @Column({ type: 'json', nullable: true })
  valoresAnteriores?: { [key: string]: any };

  @Column({ type: 'json', nullable: true })
  valoresNuevos?: { [key: string]: any };

  @Column({ type: 'json', nullable: true })
  cambiosDetallados?: {
    campo: string;
    valorAnterior: any;
    valorNuevo: any;
    tipo: string;
  }[];

  // Información adicional
  @Column({
    type: 'enum',
    enum: NivelSeveridad,
    default: NivelSeveridad.INFO,
  })
  severidad: NivelSeveridad;

  @Column({ type: 'json', nullable: true })
  metadatos?: {
    modulo?: string;
    endpoint?: string;
    metodo?: string;
    parametros?: any;
    resultado?: string;
    duracionMs?: number;
    [key: string]: any;
  };

  @Column({ type: 'text', nullable: true })
  observaciones?: string;

  // Información de contexto
  @Column({ nullable: true })
  origenAccion?: string; // 'web', 'api', 'sistema', 'importacion'

  @Column({ nullable: true })
  referenciaExterna?: string; // Para relacionar con sistemas externos

  @Column({ default: false })
  esAccionSensible: boolean; // Para marcar acciones críticas

  @Column({ default: false })
  requiereRevision: boolean;

  @Column({ type: 'timestamp', nullable: true })
  fechaRevision?: Date;

  @Column({ nullable: true })
  revisadoPor?: string;

  // Relaciones (comentadas para evitar dependencias circulares)
  // @ManyToOne(() => User, user => user.auditorias)
  // @JoinColumn({ name: 'usuarioId' })
  // usuario: User;

  // Métodos de utilidad
  get esAccionCritica(): boolean {
    return this.severidad === NivelSeveridad.CRITICAL || this.esAccionSensible;
  }

  get tiempoTranscurrido(): number {
    return Date.now() - this.fechaAccion.getTime();
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

  get huboModificaciones(): boolean {
    return this.accion === TipoAccion.ACTUALIZAR && 
           this.cambiosDetallados && 
           this.cambiosDetallados.length > 0;
  }

  marcarComoRevisado(revisadoPor: string): void {
    this.requiereRevision = false;
    this.fechaRevision = new Date();
    this.revisadoPor = revisadoPor;
  }

  static crearRegistroCreacion(
    tabla: string,
    registroId: string,
    valoresNuevos: any,
    usuarioId?: string,
    usuarioNombre?: string,
    metadatos?: any
  ): Partial<Auditoria> {
    return {
      accion: TipoAccion.CREAR,
      tabla,
      registroId,
      valoresNuevos,
      usuarioId,
      usuarioNombre,
      descripcion: `Nuevo registro creado en ${tabla}`,
      severidad: NivelSeveridad.INFO,
      metadatos,
      fechaAccion: new Date(),
    };
  }

  static crearRegistroActualizacion(
    tabla: string,
    registroId: string,
    valoresAnteriores: any,
    valoresNuevos: any,
    usuarioId?: string,
    usuarioNombre?: string,
    metadatos?: any
  ): Partial<Auditoria> {
    const cambiosDetallados = Auditoria.calcularCambios(valoresAnteriores, valoresNuevos);
    
    return {
      accion: TipoAccion.ACTUALIZAR,
      tabla,
      registroId,
      valoresAnteriores,
      valoresNuevos,
      cambiosDetallados,
      usuarioId,
      usuarioNombre,
      descripcion: `Registro actualizado en ${tabla} (${cambiosDetallados.length} cambios)`,
      severidad: NivelSeveridad.INFO,
      metadatos,
      fechaAccion: new Date(),
    };
  }

  static crearRegistroEliminacion(
    tabla: string,
    registroId: string,
    valoresAnteriores: any,
    usuarioId?: string,
    usuarioNombre?: string,
    metadatos?: any
  ): Partial<Auditoria> {
    return {
      accion: TipoAccion.ELIMINAR,
      tabla,
      registroId,
      valoresAnteriores,
      usuarioId,
      usuarioNombre,
      descripcion: `Registro eliminado de ${tabla}`,
      severidad: NivelSeveridad.WARNING,
      esAccionSensible: true,
      metadatos,
      fechaAccion: new Date(),
    };
  }

  static crearRegistroLogin(
    usuarioId: string,
    usuarioNombre: string,
    ipAddress?: string,
    userAgent?: string,
    exitoso: boolean = true
  ): Partial<Auditoria> {
    return {
      accion: TipoAccion.LOGIN,
      tabla: 'usuarios',
      registroId: usuarioId,
      usuarioId,
      usuarioNombre,
      ipAddress,
      userAgent,
      descripcion: exitoso ? 'Inicio de sesión exitoso' : 'Intento de inicio de sesión fallido',
      severidad: exitoso ? NivelSeveridad.INFO : NivelSeveridad.WARNING,
      fechaAccion: new Date(),
    };
  }

  static crearRegistroAccesoDenegado(
    usuarioId: string,
    usuarioNombre: string,
    recurso: string,
    ipAddress?: string,
    metadatos?: any
  ): Partial<Auditoria> {
    return {
      accion: TipoAccion.ACCESO_DENEGADO,
      tabla: 'usuarios',
      registroId: usuarioId,
      usuarioId,
      usuarioNombre,
      ipAddress,
      descripcion: `Acceso denegado a ${recurso}`,
      severidad: NivelSeveridad.WARNING,
      esAccionSensible: true,
      metadatos: {
        recurso,
        ...metadatos,
      },
      fechaAccion: new Date(),
    };
  }

  private static calcularCambios(valoresAnteriores: any, valoresNuevos: any): {
    campo: string;
    valorAnterior: any;
    valorNuevo: any;
    tipo: string;
  }[] {
    const cambios: {
      campo: string;
      valorAnterior: any;
      valorNuevo: any;
      tipo: string;
    }[] = [];

    // Obtener todos los campos únicos
    const campos = new Set([
      ...Object.keys(valoresAnteriores || {}),
      ...Object.keys(valoresNuevos || {}),
    ]);

    campos.forEach(campo => {
      const valorAnterior = valoresAnteriores?.[campo];
      const valorNuevo = valoresNuevos?.[campo];

      // Comparar valores (considerando tipos)
      if (JSON.stringify(valorAnterior) !== JSON.stringify(valorNuevo)) {
        let tipo = 'modificado';
        
        if (valorAnterior === undefined || valorAnterior === null) {
          tipo = 'agregado';
        } else if (valorNuevo === undefined || valorNuevo === null) {
          tipo = 'eliminado';
        }

        cambios.push({
          campo,
          valorAnterior,
          valorNuevo,
          tipo,
        });
      }
    });

    return cambios;
  }
}

