import { cookies } from 'next/headers';

import { createServerClient } from '@/plugins/supabase/server';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    const { error } = await supabase.from('profiles').select('id').limit(1);

    if (error) {
      return Response.json({ status: 'error', error: error.message }, { status: 500 });
    }

    return Response.json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Healthcheck failed:', error);
    return Response.json({ status: 'error', error: 'Internal server error' }, { status: 500 });
  }
}
