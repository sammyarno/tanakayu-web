import type { UserRole } from '@/types/auth';

export const ROLES = {
  SUPERADMIN: 'SUPERADMIN',
  MEMBER: 'MEMBER',
  MERCHANT: 'MERCHANT',
} as const satisfies Record<string, UserRole>;

/** Superadmin only */
export const SUPERADMIN_ONLY: UserRole[] = [ROLES.SUPERADMIN];

/** Roles that can verify members */
export const VERIFY_MEMBER_ROLES: UserRole[] = [ROLES.SUPERADMIN, ROLES.MERCHANT];

/** All roles (for pages accessible to everyone) */
export const ALL_ROLES: UserRole[] = [ROLES.SUPERADMIN, ROLES.MEMBER, ROLES.MERCHANT];
