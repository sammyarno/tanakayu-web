import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { verifyAuth } from '@/lib/auth';
import { createServerClient } from '@/plugins/supabase/server';
import { User } from '@/types/auth';
import { FetchResponse } from '@/types/fetch';

export async function GET(request: NextRequest) {
  const response: FetchResponse<User> = {};

  try {
    const { error: authError } = await verifyAuth(request);
    if (authError) return authError;

    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore, true);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const username = searchParams.get('username');

    if (!id && !username) {
      response.error = 'Either id or username parameter is required';
      return NextResponse.json(response, { status: 400 });
    }

    let query = supabase.from('profiles').select('id, username, full_name, address, phone_number, role');

    if (id) {
      query = query.eq('id', id);
    } else if (username) {
      query = query.eq('username', username);
    }

    // When id is known, fetch profile and auth user email in parallel
    if (id) {
      const [profileResult, authResult] = await Promise.all([
        query.single(),
        supabase.auth.admin.getUserById(id),
      ]);

      if (profileResult.error) {
        console.error('Error fetching user:', profileResult.error);
        response.error = 'User not found';
        return NextResponse.json(response, { status: 404 });
      }

      const data = profileResult.data;
      response.data = {
        id: data.id,
        username: data.username,
        email: authResult.data?.user?.email || '',
        displayName: data.full_name,
        phone: data.phone_number,
        address: data.address,
        role: data.role,
      } as User;
    } else {
      const { data, error } = await query.single();

      if (error) {
        console.error('Error fetching user:', error);
        response.error = 'User not found';
        return NextResponse.json(response, { status: 404 });
      }

      const { data: { user: authUser } } = await supabase.auth.admin.getUserById(data.id);

      response.data = {
        id: data.id,
        username: data.username,
        email: authUser?.email || '',
        displayName: data.full_name,
        phone: data.phone_number,
        address: data.address,
        role: data.role,
      } as User;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching profile:', error);
    response.error = 'Internal server error';
    return NextResponse.json(response, { status: 500 });
  }
}
