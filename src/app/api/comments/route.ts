import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

import { createServerClient } from '@/plugins/supabase/server';
import { verifyAuth } from '@/lib/auth';
import type { FetchResponse, SimpleResponse } from '@/types/fetch';

export async function POST(request: NextRequest) {
  const response: FetchResponse<SimpleResponse> = {};

  try {
    const { user, error: authError } = await verifyAuth(request);
    if (authError) return authError;

    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore, true); // Use authenticated client and service role? Wait, the plan says "switch from unauthenticated Supabase to authenticated flow". Service role is needed? I will just pass `true` to match other write APIs. Update: Wait, `createServerClient(cookieStore, true)` uses service role. I will pass `true`.
    const body = await request.json();

    const { targetId, targetType, comment } = body;
    const actor = user!.username;

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
