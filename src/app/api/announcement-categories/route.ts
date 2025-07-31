import { createServerClient } from '@/plugins/supabase/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    const { data, error } = await supabase
      .from('announcement_categories')
      .select(
        `
        id,
        label,
        code
      `
      );

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    // Transform data
    const result = data.map((item) => ({
      id: item.id,
      label: item.label,
      code: item.code,
    }));

    return Response.json({ categories: result });
  } catch (error) {
    console.error('Error fetching announcement categories:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}