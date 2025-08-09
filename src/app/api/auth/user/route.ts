import { cookies } from 'next/headers';

import { verifyJwt } from '@/lib/jwt';
import { createServerClient } from '@/plugins/supabase/server';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json({ error: 'No valid authorization token' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const jwtPayload = await verifyJwt(token);

    if (!jwtPayload) {
      return Response.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const supabase = createServerClient(cookieStore);

    const { data: userData, error } = await supabase
      .from('users')
      .select('id, username, email, full_name, phone_number, address, created_at')
      .eq('id', jwtPayload.id)
      .eq('username', jwtPayload.username)
      .single();

    if (error) {
      console.error('Database error:', error);
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    return Response.json({
      user: {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        display_name: userData.full_name,
        phone: userData.phone_number,
        address: userData.address,
        created_at: userData.created_at,
      },
    });
  } catch (error) {
    console.error('Error getting user:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
