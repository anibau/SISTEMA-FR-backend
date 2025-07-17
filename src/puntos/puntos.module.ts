import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PuntosService } from './puntos.service';
import { PuntosController } from './puntos.controller';
import { PuntoMovimiento, PuntoCanje, PuntoConfiguracion } from './entities/punto.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PuntoMovimiento, PuntoCanje, PuntoConfiguracion]),
  ],
  controllers: [PuntosController],
  providers: [PuntosService],
  exports: [PuntosService],
})
export class PuntosModule {}

