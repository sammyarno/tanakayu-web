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
    return role === 'SUPERADMIN';
  };

  const isAdmin = (): boolean => {
    return role === 'SUPERADMIN' || role === 'ADMINISTRATOR';
  };

  const isMember = (): boolean => {
    return role === 'MEMBER';
  };

  const isAuthenticated = (): boolean => {
    return !!user;
  };

  return {
    role: role as UserRole | undefined,
    hasRole,
    hasAnyRole,
    isSuperAdmin,
    isAdmin,
    isMember,
    isAuthenticated,
  };
};

export type { UserRole };
