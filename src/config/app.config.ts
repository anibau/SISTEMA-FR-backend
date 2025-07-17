import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  // Configuración básica de la aplicación
  name: process.env.APP_NAME || 'Sistema Francachela Backend',
  version: process.env.APP_VERSION || '1.0.0',
  environment: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,

  // Configuración JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'tu_jwt_secret_super_seguro_aqui_cambiar_en_produccion',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },

  // Configuración CORS
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3001'],
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },

  // Configuración de archivos
  files: {
    uploadPath: process.env.UPLOAD_PATH || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5242880, // 5MB
  },

  // Configuración de notificaciones
  notifications: {
    enabled: process.env.NOTIFICATION_ENABLED === 'true',
    email: {
      enabled: process.env.EMAIL_ENABLED === 'true',
    },
    sms: {
      enabled: process.env.SMS_ENABLED === 'true',
    },
  },

  // Configuración de webhooks
  webhooks: {
    secret: process.env.WEBHOOK_SECRET || 'webhook_secret_key',
    timeout: parseInt(process.env.WEBHOOK_TIMEOUT, 10) || 5000,
  },

  // Configuración de cache
  cache: {
    ttl: parseInt(process.env.CACHE_TTL, 10) || 300, // 5 minutos
    maxItems: parseInt(process.env.CACHE_MAX_ITEMS, 10) || 100,
  },

  // Configuración de logs
  logging: {
    level: process.env.LOG_LEVEL || 'debug',
    fileEnabled: process.env.LOG_FILE_ENABLED === 'true',
    filePath: process.env.LOG_FILE_PATH || './logs',
  },

  // Configuración de negocio - Puntos
  business: {
    points: {
      defaultPerSol: parseFloat(process.env.DEFAULT_POINTS_PER_SOL) || 1,
      expiryDays: parseInt(process.env.DEFAULT_POINTS_EXPIRY_DAYS, 10) || 365,
    },
    delivery: {
      enabled: process.env.DELIVERY_ENABLED === 'true',
      radiusKm: parseFloat(process.env.DELIVERY_RADIUS_KM) || 10,
      fee: parseFloat(process.env.DELIVERY_FEE) || 5.00,
    },
    promotions: {
      autoApply: process.env.PROMO_AUTO_APPLY === 'true',
      maxDiscountPercent: parseFloat(process.env.PROMO_MAX_DISCOUNT_PERCENT) || 50,
    },
    backup: {
      enabled: process.env.BACKUP_ENABLED === 'true',
      intervalHours: parseInt(process.env.BACKUP_INTERVAL_HOURS, 10) || 24,
      retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS, 10) || 30,
    },
  },
}));

