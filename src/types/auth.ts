export type UserRole = 'SUPERADMIN' | 'MEMBER' | 'MERCHANT';

export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  phone: string;
  address: string;
  role: UserRole;
}
