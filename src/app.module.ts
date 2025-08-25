import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

// Configuraciones
import { DatabaseModule } from './database/database.module';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';

// Módulos de la aplicación
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ProductosModule } from './productos/productos.module';
import { PromocionesModule } from './promociones/promociones.module';
import { PuntosModule } from './puntos/puntos.module';
import { DeliveryModule } from './delivery/delivery.module';
import { CierresCajaModule } from './cierres-caja/cierres-caja.module';
import { GastosModule } from './gastos/gastos.module';
import { CatalogoModule } from './catalogo/catalogo.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';

// Interceptors y Filters globales
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

// Controlador principal
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // Configuración global
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // Base de datos
    DatabaseModule,

    // Módulos de funcionalidad
    AuthModule,
    UsuariosModule,
    ProductosModule,
    PromocionesModule,
    PuntosModule,
    DeliveryModule,
    CierresCajaModule,
    GastosModule,
    CatalogoModule,
    NotificacionesModule,
    
    // TODO: Agregar módulos restantes cuando estén listos
    // CombosModule,
    // VentasModule,
    // ClientesModule,
    // WebhooksModule,
    // ConfiguracionesModule,
    // AuditoriaModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
