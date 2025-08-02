import { User } from '@supabase/supabase-js';

/**
 * Limited user data that we want to store
 * Contains only essential user information
 */
export interface LimitedUserData {
  id: string;
  email?: string;
  phone?: string;
  display_name?: string;
  role?: string;
}

/**
 * Convert a Supabase User object to our limited user data format
 */
export function toLimitedUserData(user: User | null): LimitedUserData | null {
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    role: user.role,
    display_name: user.user_metadata?.display_name || user.user_metadata?.full_name || undefined,
  };
}
