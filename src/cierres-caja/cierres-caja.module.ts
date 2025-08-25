import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CierresCajaService } from './cierres-caja.service';
import { CierresCajaController } from './cierres-caja.controller';
import { CierreCaja, MovimientoCaja } from './entities/cierre-caja.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CierreCaja, MovimientoCaja]),
  ],
  controllers: [CierresCajaController],
  providers: [CierresCajaService],
  exports: [CierresCajaService],
})
export class CierresCajaModule {}

