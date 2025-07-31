import { createServerClient } from '@/plugins/supabase/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    const { error } = await supabase.auth.signOut();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error signing out:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}