import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { UsuarioProfile } from './entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { PaginationDto, PaginationResponseDto } from '../common/dto/pagination.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UsuarioProfile)
    private usuarioProfileRepository: Repository<UsuarioProfile>,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto): Promise<User> {
    const { email, password, firstName, lastName, role, phone, bio, permissions } = createUsuarioDto;

    // Verificar si el usuario ya existe
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Crear usuario
    const user = this.userRepository.create({
      email,
      password,
      firstName,
      lastName,
      role,
      phone,
      isEmailVerified: true,
    });

    const savedUser = await this.userRepository.save(user);

    // Crear perfil de usuario
    const userProfile = this.usuarioProfileRepository.create({
      userId: savedUser.id,
      bio,
      permissions: permissions || this.getDefaultPermissions(role),
      preferences: {
        theme: 'light',
        language: 'es',
        notifications: true,
        autoSave: true,
      },
    });

    await this.usuarioProfileRepository.save(userProfile);

    return savedUser;
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginationResponseDto<any>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [users, total] = await this.userRepository.findAndCount({
      where: { isActive: true },
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['profile'], // Si tienes la relación configurada
    });

    // Obtener perfiles de usuarios
    const usersWithProfiles = await Promise.all(
      users.map(async (user) => {
        const profile = await this.usuarioProfileRepository.findOne({
          where: { userId: user.id },
        });

        const { password, ...userWithoutPassword } = user;
        return {
          ...userWithoutPassword,
          profile,
        };
      })
    );

    return new PaginationResponseDto(usersWithProfiles, total, page, limit);
  }

  async findOne(id: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id, isActive: true },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const profile = await this.usuarioProfileRepository.findOne({
      where: { userId: id },
    });

    const { password, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      profile,
    };
  }

  async update(id: string, updateUsuarioDto: UpdateUsuarioDto): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id, isActive: true },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const { permissions, preferences, bio, ...userUpdates } = updateUsuarioDto;

    // Actualizar datos del usuario
    if (Object.keys(userUpdates).length > 0) {
      await this.userRepository.update(id, userUpdates);
    }

    // Actualizar perfil del usuario
    if (permissions || preferences || bio !== undefined) {
      const profile = await this.usuarioProfileRepository.findOne({
        where: { userId: id },
      });

      if (profile) {
        const profileUpdates: any = {};
        if (permissions) profileUpdates.permissions = permissions;
        if (preferences) profileUpdates.preferences = preferences;
        if (bio !== undefined) profileUpdates.bio = bio;

        await this.usuarioProfileRepository.update(profile.id, profileUpdates);
      }
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id, isActive: true },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Soft delete
    await this.userRepository.update(id, { isActive: false });
  }

  async updateStats(userId: string, stats: {
    totalSales?: number;
    totalSalesAmount?: number;
    totalClients?: number;
  }): Promise<void> {
    const profile = await this.usuarioProfileRepository.findOne({
      where: { userId },
    });

    if (profile) {
      await this.usuarioProfileRepository.update(profile.id, {
        ...stats,
        lastActivityAt: new Date(),
      });
    }
  }

  async getUserPermissions(userId: string): Promise<any> {
    const profile = await this.usuarioProfileRepository.findOne({
      where: { userId },
    });

    return profile?.permissions || this.getDefaultPermissions('vendedor');
  }

  async updateUserPermissions(userId: string, permissions: any): Promise<void> {
    const profile = await this.usuarioProfileRepository.findOne({
      where: { userId },
    });

    if (profile) {
      await this.usuarioProfileRepository.update(profile.id, { permissions });
    }
  }

  private getDefaultPermissions(role: string): any {
    const basePermissions = {
      canCreateProducts: false,
      canEditPrices: false,
      canDeleteSales: false,
      canViewReports: false,
      canManageUsers: false,
      canManagePromotions: false,
      canAccessDelivery: true,
      canManageClients: true,
    };

    if (role === 'administrador') {
      return {
        canCreateProducts: true,
        canEditPrices: true,
        canDeleteSales: true,
        canViewReports: true,
        canManageUsers: true,
        canManagePromotions: true,
        canAccessDelivery: true,
        canManageClients: true,
      };
    }

    return basePermissions;
  }

  async getActiveUsersCount(): Promise<number> {
    return this.userRepository.count({
      where: { isActive: true },
    });
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return this.userRepository.find({
      where: { role: role as any, isActive: true },
      select: ['id', 'email', 'firstName', 'lastName', 'role'],
    });
  }
}

