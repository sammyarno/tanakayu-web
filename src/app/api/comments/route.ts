import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

import { createServerClient } from '@/plugins/supabase/server';
import type { FetchResponse, SimpleResponse } from '@/types/fetch';

export async function POST(request: NextRequest) {
  const response: FetchResponse<SimpleResponse> = {};

  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);
    const body = await request.json();

    const { targetId, targetType, comment, actor } = body;

    const { data, error } = await supabase
      .from('comments')
      .insert([
        {
          comment,
          created_by: actor,
          target_id: targetId,
          target_type: targetType,
        },
      ])
      .select('id');

    if (error) {
      response.error = error.message;
      return Response.json(response, { status: 500 });
    }

    response.data = data[0];
    return Response.json(response);
  } catch (error) {
    console.error('Error posting comment:', error);
    response.error = 'Internal server error';
    return Response.json(response, { status: 500 });
  }
}
