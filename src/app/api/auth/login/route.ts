import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

import bcrypt, { compareWithSalt, hashWithSalt } from '@/lib/bcrypt';
import { signJwt, signRefreshJwt } from '@/lib/jwt';
import { loginSchema } from '@/lib/validations/auth';
import { createServerClient } from '@/plugins/supabase/server';
import { getDateAhead } from '@/utils/date';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);
    const body = await request.json();

    // Validate input
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return Response.json({ error: 'Invalid input', details: validationResult.error.issues }, { status: 400 });
    }

    const { username, password } = validationResult.data;

    const { data, error } = await supabase
      .from('users')
      .select('id, username, hashed_password')
      .eq('username', username)
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    const isPasswordValid = await compareWithSalt(password, data.hashed_password);

    if (!isPasswordValid) {
      return Response.json({ error: 'Invalid Credentials' }, { status: 401 });
    }

    // generate JWT sign with a secret key
    const jwt = await signJwt({ id: data.id, username: data.username });

    // generate refresh token
    const refreshToken = await signRefreshJwt({ id: data.id, username: data.username });
    const hashedRefreshToken = await hashWithSalt(refreshToken);

    // store refresh token in database
    await supabase.from('refresh_tokens').insert({
      user_id: data.id,
      hashed_token: hashedRefreshToken,
      expired_at: getDateAhead(7),
      user_agent: request.headers.get('user-agent') || '',
    });

    // Set refresh token as HttpOnly cookie and return only JWT
    const response = Response.json({ jwt });
    response.headers.set(
      'Set-Cookie',
      `refresh_token=${refreshToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${7 * 24 * 60 * 60}`
    );

    return response;
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
