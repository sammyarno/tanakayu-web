import { createServerClient } from '@/plugins/supabase/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    const { data, error } = await supabase.auth.getUser();

    if (error) {
      return Response.json({ error: error.message }, { status: 401 });
    }

    return Response.json({ user: data.user });
  } catch (error) {
    console.error('Error getting user:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}