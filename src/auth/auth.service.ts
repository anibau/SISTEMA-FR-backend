import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Buscar usuario por email
    const user = await this.userRepository.findOne({
      where: { email, isActive: true },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar si la cuenta está bloqueada
    if (user.isLocked) {
      throw new UnauthorizedException(
        'Cuenta bloqueada temporalmente. Intenta más tarde.',
      );
    }

    // Validar contraseña
    const isPasswordValid = await user.validatePassword(password);
    
    if (!isPasswordValid) {
      // Incrementar intentos fallidos
      user.incrementLoginAttempts();
      await this.userRepository.save(user);
      
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Reset intentos de login y actualizar último acceso
    user.resetLoginAttempts();
    await this.userRepository.save(user);

    // Generar token JWT
    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role 
    };
    
    const accessToken = this.jwtService.sign(payload);
    const expiresIn = this.getTokenExpirationTime();

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        fullName: user.fullName,
      },
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, firstName, lastName, role, phone } = registerDto;

    // Verificar si el usuario ya existe
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Crear nuevo usuario
    const user = this.userRepository.create({
      email,
      password,
      firstName,
      lastName,
      role,
      phone,
      isEmailVerified: true, // Por simplicidad, lo marcamos como verificado
    });

    await this.userRepository.save(user);

    // Generar token JWT
    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role 
    };
    
    const accessToken = this.jwtService.sign(payload);
    const expiresIn = this.getTokenExpirationTime();

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        fullName: user.fullName,
      },
    };
  }

  async validateUserById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id, isActive: true },
    });
  }

  async getProfile(userId: string): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({
      where: { id: userId, isActive: true },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const { password, ...userProfile } = user;
    return userProfile;
  }

  async refreshToken(userId: string): Promise<{ accessToken: string; expiresIn: number }> {
    const user = await this.validateUserById(userId);
    
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role 
    };
    
    const accessToken = this.jwtService.sign(payload);
    const expiresIn = this.getTokenExpirationTime();

    return {
      accessToken,
      expiresIn,
    };
  }

  private getTokenExpirationTime(): number {
    const expiresIn = this.configService.get<string>('app.jwt.expiresIn', '24h');
    
    // Convertir a segundos (simplificado para casos comunes)
    if (expiresIn.endsWith('h')) {
      return parseInt(expiresIn) * 3600;
    } else if (expiresIn.endsWith('d')) {
      return parseInt(expiresIn) * 86400;
    } else if (expiresIn.endsWith('m')) {
      return parseInt(expiresIn) * 60;
    }
    
    return 86400; // 24 horas por defecto
  }
}

