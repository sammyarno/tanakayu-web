import { ROLES } from '@/constants/roles';
import type { UserRole } from '@/types/auth';

import { useAuth } from './useAuth';

export const useRoleCheck = () => {
  const { role, user } = useAuth();

  const hasRole = (requiredRole: UserRole): boolean => {
    return role === requiredRole;
  };

  const hasAnyRole = (requiredRoles: UserRole[]): boolean => {
    return requiredRoles.includes(role as UserRole);
  };

  const isSuperAdmin = (): boolean => {
    return role === ROLES.SUPERADMIN;
  };

  const isMember = (): boolean => {
    return role === ROLES.MEMBER;
  };

  const isMerchant = (): boolean => {
    return role === ROLES.MERCHANT;
  };

  const isAuthenticated = (): boolean => {
    return !!user;
  };

  return {
    role: role as UserRole | undefined,
    hasRole,
    hasAnyRole,
    isSuperAdmin,
    isMember,
    isMerchant,
    isAuthenticated,
  };
};

export type { UserRole };
