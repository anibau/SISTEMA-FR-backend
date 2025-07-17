import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromocionesService } from './promociones.service';
import { PromocionesController } from './promociones.controller';
import { Promocion, PromocionUso } from './entities/promocion.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Promocion, PromocionUso]),
  ],
  controllers: [PromocionesController],
  providers: [PromocionesService],
  exports: [PromocionesService],
})
export class PromocionesModule {}

