import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { User } from '../auth/entities/user.entity';
// import { UsuarioProfile } from './entities/usuario.entity'; // No existe

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [UsuariosService],
})
export class UsuariosModule {}
