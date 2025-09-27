import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CombosService } from './combos.service';
import { CombosController } from './combos.controller';
import { Combo } from './entities/combo.entity';
import { ComboDetalle } from './entities/combo-detalle.entity';
import { Producto } from '../productos/entities/producto.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Combo,
      ComboDetalle,
      Producto,
    ]),
  ],
  controllers: [CombosController],
  providers: [CombosService],
  exports: [CombosService],
})
export class CombosModule {}

