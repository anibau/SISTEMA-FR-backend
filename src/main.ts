import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Configuración global de validación
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Filtro global de excepciones
  app.useGlobalFilters(new AllExceptionsFilter());

  // Configuración de CORS
  app.enableCors({
    origin: configService.get<string>('app.corsOrigin', '*'),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Prefijo global para la API
  app.setGlobalPrefix('api/v1');

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Francachela API')
    .setDescription('API completa para el sistema de gestión de licorería Francachela')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Ingresa tu token JWT',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('App', 'Endpoints generales de la aplicación')
    .addTag('Auth', 'Autenticación y autorización')
    .addTag('Usuarios', 'Gestión de usuarios del sistema')
    .addTag('Productos', 'Gestión de productos e inventario')
    .addTag('Combos', 'Gestión de combos y paquetes')
    .addTag('Promociones', 'Gestión de promociones y descuentos')
    .addTag('Ventas', 'Gestión de ventas y POS')
    .addTag('Cierres de Caja', 'Gestión de cierres de caja por turno')
    .addTag('Gastos', 'Registro y gestión de gastos')
    .addTag('Clientes', 'Gestión de clientes y fidelización')
    .addTag('Puntos', 'Sistema de puntos y recompensas')
    .addTag('Delivery', 'Gestión de pedidos y delivery')
    .addTag('Catálogo', 'Catálogo público de productos')
    .addTag('Notificaciones', 'Sistema de notificaciones')
    .addTag('Webhooks', 'Webhooks internos del sistema')
    .addTag('Configuraciones', 'Configuraciones del sistema')
    .addTag('Auditoría', 'Logs y auditoría del sistema')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  // Puerto de la aplicación
  const port = configService.get<number>('app.port', 3000);
  
  await app.listen(port);
  
  logger.log(`🚀 Aplicación iniciada en: http://localhost:${port}`);
  logger.log(`📚 Documentación Swagger: http://localhost:${port}/docs`);
  logger.log(`🌍 Entorno: ${configService.get<string>('app.nodeEnv')}`);
  logger.log(`🗄️  Base de datos: ${configService.get<string>('database.type')}`);
}

bootstrap().catch((error) => {
  Logger.error('❌ Error al iniciar la aplicación:', error);
  process.exit(1);
});

