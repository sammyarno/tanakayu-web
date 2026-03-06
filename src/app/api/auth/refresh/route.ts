import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

import { compareWithSalt, hashWithSalt } from '@/lib/bcrypt';
import { signJwt, signRefreshJwt, verifyJwt, verifyRefreshJwt } from '@/lib/jwt';
import { createServerClient } from '@/plugins/supabase/server';
import { getDateAhead, getNowDate } from '@/utils/date';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore, true);

    // Extract tokens from request
    const authHeader = request.headers.get('authorization');
    const refreshTokenCookie = cookieStore.get('refresh_token')?.value;

    if (!refreshTokenCookie) {
      return Response.json({ error: 'Refresh token not found' }, { status: 401 });
    }

    // Check if access token is still valid (optional optimization)
    if (authHeader?.startsWith('Bearer ')) {
      const accessToken = authHeader.substring(7);
      const validPayload = await verifyJwt(accessToken);

      if (validPayload) {
        return Response.json({ jwt: accessToken });
      }
    }

    // Verify refresh token JWT structure first
    const refreshPayload = await verifyRefreshJwt(refreshTokenCookie);
    if (!refreshPayload) {
      return Response.json({ error: 'Invalid refresh token' }, { status: 401 });
    }

    // Find matching refresh token in database by (user_id, token_jti) — O(1) lookup
    const { data: storedToken, error: fetchError } = await supabase
      .from('refresh_tokens')
      .select('id, hashed_token, expired_at, user_id')
      .eq('user_id', refreshPayload.id)
      .eq('token_jti', refreshPayload.jti)
      .gte('expired_at', getNowDate())
      .single();

    if (fetchError || !storedToken) {
      return Response.json({ error: 'No valid refresh tokens found' }, { status: 401 });
    }

    // One bcrypt compare
    const isMatch = await compareWithSalt(refreshTokenCookie, storedToken.hashed_token);
    if (!isMatch) {
      return Response.json({ error: 'Invalid refresh token' }, { status: 401 });
    }

    // Get user data for new tokens
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, username, role')
      .eq('id', refreshPayload.id)
      .single();

    if (userError || !userData) {
      return Response.json({ error: 'User not found' }, { status: 401 });
    }

    // Generate new tokens
    const newAccessToken = await signJwt({ id: userData.id, username: userData.username, role: userData.role });
    const newTokenJti = crypto.randomUUID();
    const newRefreshToken = await signRefreshJwt({ id: userData.id, username: userData.username, role: userData.role }, newTokenJti);
    const hashedNewRefreshToken = await hashWithSalt(newRefreshToken);

    // Update refresh token in database (replace the old one)
    const { error: updateError } = await supabase
      .from('refresh_tokens')
      .update({
        hashed_token: hashedNewRefreshToken,
        token_jti: newTokenJti,
        expired_at: getDateAhead(7),
        user_agent: request.headers.get('user-agent') || '',
      })
      .eq('id', storedToken.id);

    if (updateError) {
      return Response.json({ error: 'Failed to update refresh token' }, { status: 500 });
    }

    // Clean up other expired refresh tokens for this user
    await supabase.from('refresh_tokens').delete().eq('user_id', userData.id).lt('expired_at', getNowDate());

    // Set new refresh token as HttpOnly cookie
    const response = Response.json({ jwt: newAccessToken, refresh_token: newRefreshToken });
    response.headers.set(
      'Set-Cookie',
      `refresh_token=${newRefreshToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${7 * 24 * 60 * 60}`
    );

    return response;
  } catch (error) {
    console.error('Refresh token error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
