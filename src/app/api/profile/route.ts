import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { createServerClient } from '@/plugins/supabase/server';
import { User } from '@/types/auth';
import { FetchResponse } from '@/types/fetch';

export async function GET(request: NextRequest) {
  const response: FetchResponse<User> = {};

  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const username = searchParams.get('username');

    if (!id && !username) {
      response.error = 'Either id or username parameter is required';
      return NextResponse.json(response, { status: 400 });
    }

    let query = supabase.from('users').select('id, username, email, full_name, address, phone_number');

    if (id) {
      query = query.eq('id', id);
    } else if (username) {
      query = query.eq('username', username);
    }

    const { data, error } = await query.single();

    if (error) {
      console.error('Error fetching user:', error);
      response.error = 'User not found';
      return NextResponse.json(response, { status: 404 });
    }

    response.data = data;

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching profile:', error);
    response.error = 'Internal server error';
    return NextResponse.json(response, { status: 500 });
  }
}
