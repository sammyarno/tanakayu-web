import { cookies } from 'next/headers';

import { verifyRefreshJwt } from '@/lib/jwt';
import { createServerClient } from '@/plugins/supabase/server';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    // Extract refresh token from cookie
    const refreshTokenCookie = cookieStore.get('refresh_token')?.value;

    if (!refreshTokenCookie) {
      const response = Response.json({ success: true });
      response.headers.set('Set-Cookie', 'refresh_token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0');
      return response;
    }

    const refreshPayload = await verifyRefreshJwt(refreshTokenCookie);

    if (refreshPayload) {
      // multi-device logout
      await supabase.from('refresh_tokens').delete().eq('user_id', refreshPayload.id);
    }

    // Clear refresh token cookie
    const response = Response.json({ success: true });
    response.headers.set('Set-Cookie', 'refresh_token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0');

    return response;
  } catch (error) {
    console.error('Error signing out:', error);

    // Even if there's an error, clear the cookie
    const response = Response.json({ error: 'Internal server error' }, { status: 500 });
    response.headers.set('Set-Cookie', 'refresh_token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0');

    return response;
  }
}
