import { createServerClient } from '@/plugins/supabase/server';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);
    const body = await request.json();
    
    const { email, password } = body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return Response.json({ error: error.message }, { status: 401 });
    }

    return Response.json({ user: data.user, session: data.session });
  } catch (error) {
    console.error('Error signing in:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}