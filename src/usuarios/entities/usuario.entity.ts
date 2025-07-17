import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { UserRole } from '../../common/decorators/roles.decorator';
import { User } from '../../auth/entities/user.entity';

// Nota: Esta entidad extiende User para funcionalidades adicionales específicas del módulo usuarios
// En una implementación real, podrías considerar usar User directamente o crear una relación
@Entity('usuarios_profile')
export class UsuarioProfile extends BaseEntity {
  @Column()
  userId: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ nullable: true })
  bio?: string;

  @Column({ type: 'json', nullable: true })
  preferences?: {
    theme: 'light' | 'dark';
    language: string;
    notifications: boolean;
    autoSave: boolean;
  };

  @Column({ type: 'json', nullable: true })
  permissions?: {
    canCreateProducts: boolean;
    canEditPrices: boolean;
    canDeleteSales: boolean;
    canViewReports: boolean;
    canManageUsers: boolean;
    canManagePromotions: boolean;
    canAccessDelivery: boolean;
    canManageClients: boolean;
  };

  @Column({ type: 'timestamp', nullable: true })
  lastActivityAt?: Date;

  @Column({ default: 0 })
  totalSales: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalSalesAmount: number;

  @Column({ default: 0 })
  totalClients: number;

  // Relación con User (auth)
  // @OneToOne(() => User, user => user.profile)
  // user: User;

  // Estadísticas adicionales
  @Column({ type: 'json', nullable: true })
  stats?: {
    dailyAverage: number;
    weeklyAverage: number;
    monthlyAverage: number;
    bestSaleDay: string;
    favoritePaymentMethod: string;
  };
}

