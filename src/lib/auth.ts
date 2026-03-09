import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { createServerClient } from '@/plugins/supabase/server';

export interface AuthUser {
  id: string;
  username: string;
  role: string;
}

/**
 * Verifies the current user's session via Supabase Auth and fetches their profile.
 * Use in API routes that require authentication.
 */
export async function verifyAuth(request: Request): Promise<{ user?: AuthUser; error?: NextResponse }> {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
    }

    // Fetch profile for username and role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('username, role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return { error: NextResponse.json({ error: 'Profile not found' }, { status: 401 }) };
    }

    return {
      user: {
        id: user.id,
        username: profile.username,
        role: profile.role,
      },
    };
  } catch (err) {
    console.error('Auth verification error:', err);
    return { error: NextResponse.json({ error: 'Internal server error during authentication' }, { status: 500 }) };
  }
}
