import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}

  getHello() {
    return {
      message: 'Francachela API - Tu tienda de licores',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      environment: this.configService.get<string>('app.nodeEnv', 'development'),
      status: 'healthy',
    };
  }

  getHealthStatus() {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: {
        seconds: Math.floor(uptime),
        human: this.formatUptime(uptime),
      },
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`,
      },
      environment: {
        nodeEnv: this.configService.get<string>('app.nodeEnv'),
        nodeVersion: process.version,
        platform: process.platform,
      },
      database: {
        status: 'connected', // Se puede mejorar con verificación real
        type: 'postgresql',
      },
    };
  }

  private formatUptime(uptime: number): string {
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    
    return `${hours}h ${minutes}m ${seconds}s`;
  }
}

