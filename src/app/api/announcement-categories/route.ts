import { cookies } from 'next/headers';

import { createServerClient } from '@/plugins/supabase/server';
import type { Category } from '@/types';
import type { FetchResponse } from '@/types/fetch';

export async function GET() {
  const response: FetchResponse<Category[]> = {};

  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    const { data, error } = await supabase.from('announcement_categories').select(
      `
        id,
        label,
        code
      `
    );

    if (error) {
      response.error = error.message;
      return Response.json(response, { status: 500 });
    }

    // Transform data
    const result = data.map(item => ({
      id: item.id,
      label: item.label,
      code: item.code,
    }));

    response.data = result;
    return Response.json(response);
  } catch (error) {
    console.error('Error fetching categories:', error);
    response.error = 'Internal server error';
    return Response.json(response, { status: 500 });
  }
}
