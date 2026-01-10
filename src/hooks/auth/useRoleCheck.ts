import { useAuth } from './useAuth';

type UserRole = 'ADMIN' | 'PENGHUNI' | 'PENGURUS';

export const useRoleCheck = () => {
  const { role, user } = useAuth();

  const hasRole = (requiredRole: UserRole): boolean => {
    return role === requiredRole;
  };

  const hasAnyRole = (requiredRoles: UserRole[]): boolean => {
    return requiredRoles.includes(role as UserRole);
  };

  const isAdmin = (): boolean => {
    return role === 'ADMIN';
  };

  const isMember = (): boolean => {
    return role === 'PENGHUNI';
  };

  const isAuthenticated = (): boolean => {
    return !!user;
  };

  return {
    role: role as UserRole | undefined,
    hasRole,
    hasAnyRole,
    isAdmin,
    isMember,
    isAuthenticated,
  };
};

export type { UserRole };
