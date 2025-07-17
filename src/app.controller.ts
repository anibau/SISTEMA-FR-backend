import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from './auth/decorators/public.decorator';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public()
  @ApiOperation({ 
    summary: 'Health check',
    description: 'Endpoint público para verificar el estado de la API'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'API funcionando correctamente',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Francachela API - Tu tienda de licores' },
        version: { type: 'string', example: '1.0.0' },
        timestamp: { type: 'string', example: '2024-01-15T10:30:00.000Z' },
        environment: { type: 'string', example: 'development' },
        status: { type: 'string', example: 'healthy' },
      }
    }
  })
  getHello() {
    return this.appService.getHello();
  }

  @Get('health')
  @Public()
  @ApiOperation({ 
    summary: 'Health status',
    description: 'Endpoint detallado de estado de salud del sistema'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estado de salud del sistema'
  })
  getHealth() {
    return this.appService.getHealthStatus();
  }
}

