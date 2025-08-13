import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

import { createServerClient } from '@/plugins/supabase/server';
import type { FetchResponse, SimpleResponse } from '@/types/fetch';
import { getNowDate } from '@/utils/date';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const response: FetchResponse<SimpleResponse> = {};

  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);
    const body = await request.json();
    const { id } = await params;

    const { action, actor } = body;

    const updateData: any = {};
    const currentTimestamp = getNowDate();

    if (action === 'approve') {
      updateData.approved_at = currentTimestamp;
      updateData.approved_by = actor;
    } else if (action === 'reject') {
      updateData.rejected_at = currentTimestamp;
      updateData.rejected_by = actor;
    } else if (action === 'delete') {
      updateData.deleted_at = currentTimestamp;
      updateData.deleted_by = actor;
    } else {
      response.error = 'Invalid action';
      return Response.json(response, { status: 400 });
    }

    const { data, error } = await supabase.from('comments').update(updateData).eq('id', id).select('id');

    if (error) {
      response.error = error.message;
      return Response.json(response, { status: 500 });
    }

    response.data = data[0];
    return Response.json(response);
  } catch (error) {
    console.error('Error moderating comment:', error);
    response.error = 'Internal server error';
    return Response.json(response, { status: 500 });
  }
}
