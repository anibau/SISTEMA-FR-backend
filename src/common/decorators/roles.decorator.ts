import { SetMetadata } from '@nestjs/common';

export enum UserRole {
  ADMINISTRADOR = 'administrador',
  VENDEDOR = 'vendedor',
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

