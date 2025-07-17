import { PartialType } from '@nestjs/swagger';
import { CreateCierreCajaDto } from './create-cierre-caja.dto';

export class UpdateCierreCajaDto extends PartialType(CreateCierreCajaDto) {}

