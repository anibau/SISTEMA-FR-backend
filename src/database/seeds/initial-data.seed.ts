import { DataSource } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Configuracion, TipoConfiguracion } from '../../configuraciones/entities/configuracion.entity';
import { UserRole } from '../../common/decorators/roles.decorator';
import * as bcrypt from 'bcryptjs';

export class InitialDataSeed {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    await this.createDefaultUsers();
    await this.createDefaultConfigurations();
  }

  private async createDefaultUsers(): Promise<void> {
    const userRepository = this.dataSource.getRepository(User);

    // Verificar si ya existe un administrador
    const existingAdmin = await userRepository.findOne({
      where: { email: 'admin@francachela.com' },
    });

    if (!existingAdmin) {
      const adminUser = userRepository.create({
        email: 'admin@francachela.com',
        password: await bcrypt.hash('admin123', 10),
        firstName: 'Administrador',
        lastName: 'Sistema',
        role: UserRole.ADMINISTRADOR,
        isEmailVerified: true,
      });

      await userRepository.save(adminUser);
      console.log('✅ Usuario administrador creado: admin@francachela.com / admin123');
    }

    // Crear vendedor de ejemplo
    const existingVendedor = await userRepository.findOne({
      where: { email: 'vendedor@francachela.com' },
    });

    if (!existingVendedor) {
      const vendedorUser = userRepository.create({
        email: 'vendedor@francachela.com',
        password: await bcrypt.hash('vendedor123', 10),
        firstName: 'Vendedor',
        lastName: 'Demo',
        role: UserRole.VENDEDOR,
        isEmailVerified: true,
      });

      await userRepository.save(vendedorUser);
      console.log('✅ Usuario vendedor creado: vendedor@francachela.com / vendedor123');
    }
  }

  private async createDefaultConfigurations(): Promise<void> {
    const configRepository = this.dataSource.getRepository(Configuracion);

    const defaultConfigs = [
      // Configuraciones del sistema
      {
        clave: 'sistema.nombre_tienda',
        nombre: 'Nombre de la tienda',
        descripcion: 'Nombre que aparece en facturas y documentos',
        valor: 'Francachela - Tu tienda de licores',
        tipo: TipoConfiguracion.SISTEMA,
      },
      {
        clave: 'sistema.ruc',
        nombre: 'RUC de la empresa',
        descripcion: 'Número de RUC para facturación',
        valor: '20123456789',
        tipo: TipoConfiguracion.SISTEMA,
      },
      {
        clave: 'sistema.direccion',
        nombre: 'Dirección de la tienda',
        descripcion: 'Dirección física del establecimiento',
        valor: 'Av. Principal 123, Lima, Perú',
        tipo: TipoConfiguracion.SISTEMA,
      },
      {
        clave: 'sistema.telefono',
        nombre: 'Teléfono de contacto',
        descripcion: 'Número de teléfono principal',
        valor: '+51 987 654 321',
        tipo: TipoConfiguracion.SISTEMA,
      },

      // Configuraciones de puntos
      {
        clave: 'puntos.soles_por_punto',
        nombre: 'Soles por punto',
        descripcion: 'Cantidad de soles necesarios para ganar 1 punto',
        valor: 10,
        tipo: TipoConfiguracion.PUNTOS,
        opciones: { min: 1, max: 100 },
      },
      {
        clave: 'puntos.punto_valor_soles',
        nombre: 'Valor del punto en soles',
        descripcion: 'Cuánto vale 1 punto en soles al canjearlo',
        valor: 0.10,
        tipo: TipoConfiguracion.PUNTOS,
        opciones: { min: 0.01, max: 1 },
      },
      {
        clave: 'puntos.minimo_canje',
        nombre: 'Mínimo de puntos para canje',
        descripcion: 'Cantidad mínima de puntos para poder canjear',
        valor: 100,
        tipo: TipoConfiguracion.PUNTOS,
        opciones: { min: 1, max: 1000 },
      },

      // Configuraciones de delivery
      {
        clave: 'delivery.costo_base',
        nombre: 'Costo base de delivery',
        descripcion: 'Costo fijo de delivery en soles',
        valor: 5.00,
        tipo: TipoConfiguracion.DELIVERY,
        opciones: { min: 0, max: 50 },
      },
      {
        clave: 'delivery.monto_gratis',
        nombre: 'Monto para delivery gratis',
        descripcion: 'Monto mínimo de compra para delivery gratuito',
        valor: 50.00,
        tipo: TipoConfiguracion.DELIVERY,
        opciones: { min: 0, max: 500 },
      },
      {
        clave: 'delivery.radio_km',
        nombre: 'Radio de delivery (km)',
        descripcion: 'Radio máximo de entrega en kilómetros',
        valor: 10,
        tipo: TipoConfiguracion.DELIVERY,
        opciones: { min: 1, max: 50 },
      },

      // Configuraciones de promociones
      {
        clave: 'promociones.activas',
        nombre: 'Promociones activas',
        descripcion: 'Indica si el sistema de promociones está activo',
        valor: true,
        tipo: TipoConfiguracion.PROMOCIONES,
      },
      {
        clave: 'promociones.descuento_cumpleanos',
        nombre: 'Descuento por cumpleaños (%)',
        descripcion: 'Porcentaje de descuento en el día del cumpleaños',
        valor: 10,
        tipo: TipoConfiguracion.PROMOCIONES,
        opciones: { min: 0, max: 50 },
      },

      // Configuraciones de impuestos
      {
        clave: 'impuestos.igv_porcentaje',
        nombre: 'Porcentaje de IGV',
        descripcion: 'Porcentaje del Impuesto General a las Ventas',
        valor: 18,
        tipo: TipoConfiguracion.IMPUESTOS,
        opciones: { min: 0, max: 30 },
      },
      {
        clave: 'impuestos.incluido_precio',
        nombre: 'IGV incluido en precios',
        descripcion: 'Indica si los precios ya incluyen IGV',
        valor: true,
        tipo: TipoConfiguracion.IMPUESTOS,
      },

      // Configuraciones de notificaciones
      {
        clave: 'notificaciones.stock_bajo',
        nombre: 'Notificar stock bajo',
        descripcion: 'Enviar notificaciones cuando el stock esté bajo',
        valor: true,
        tipo: TipoConfiguracion.NOTIFICACIONES,
      },
      {
        clave: 'notificaciones.cumpleanos_clientes',
        nombre: 'Notificar cumpleaños de clientes',
        descripcion: 'Enviar recordatorios de cumpleaños de clientes',
        valor: true,
        tipo: TipoConfiguracion.NOTIFICACIONES,
      },
    ];

    for (const config of defaultConfigs) {
      const existing = await configRepository.findOne({
        where: { clave: config.clave },
      });

      if (!existing) {
        const newConfig = configRepository.create(config);
        await configRepository.save(newConfig);
      }
    }

    console.log('✅ Configuraciones por defecto creadas');
  }
}

