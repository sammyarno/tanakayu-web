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
    // Extract display name from user_metadata if available
    display_name: user.user_metadata?.display_name || user.user_metadata?.full_name || undefined,
  };
}

/**
 * Convert our limited user data back to a partial Supabase User object
 * This is used when we need to provide a User object to components that expect it
 */
export function fromLimitedUserData(limitedData: LimitedUserData | null): Partial<User> | null {
  if (!limitedData) return null;
  
  return {
    id: limitedData.id,
    email: limitedData.email,
    phone: limitedData.phone,
    user_metadata: {
      display_name: limitedData.display_name,
    },
    // Add minimal required fields to satisfy the User interface
    app_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  };
}