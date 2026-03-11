import type { UserRole } from '@/types/auth';

export const ROLES = {
  SUPERADMIN: 'SUPERADMIN',
  ADMINISTRATOR: 'ADMINISTRATOR',
  MEMBER: 'MEMBER',
  MERCHANT: 'MERCHANT',
} as const satisfies Record<string, UserRole>;

/** Superadmin only */
export const SUPERADMIN_ONLY: UserRole[] = [ROLES.SUPERADMIN];

/** Roles that have admin dashboard access */
export const ADMIN_ROLES: UserRole[] = [ROLES.SUPERADMIN, ROLES.ADMINISTRATOR];

/** Roles that can verify members */
export const VERIFY_MEMBER_ROLES: UserRole[] = [ROLES.SUPERADMIN, ROLES.ADMINISTRATOR, ROLES.MERCHANT];

/** All roles (for pages accessible to everyone) */
export const ALL_ROLES: UserRole[] = [ROLES.SUPERADMIN, ROLES.ADMINISTRATOR, ROLES.MEMBER, ROLES.MERCHANT];
