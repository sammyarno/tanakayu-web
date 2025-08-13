import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

import { createServerClient } from '@/plugins/supabase/server';
import type { FetchResponse, SimpleResponse } from '@/types/fetch';
import { getNowDate } from '@/utils/date';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const response: FetchResponse<SimpleResponse> = {};

  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore, true);
    const body = await request.json();

    const { title, content, type, startDate, endDate, actor } = body;

    const updateData: any = {
      modified_by: actor,
      modified_at: getNowDate(),
    };

    const isDeleteOperation =
      title === undefined &&
      content === undefined &&
      type === undefined &&
      startDate === undefined &&
      endDate === undefined;

    if (isDeleteOperation) {
      updateData.deleted_at = getNowDate();
      updateData.deleted_by = actor;
    } else {
      if (title !== undefined) updateData.title = title;
      if (content !== undefined) updateData.content = content;
      if (type !== undefined) updateData.type = type;
      if (startDate !== undefined) updateData.start_date = startDate;
      if (endDate !== undefined) updateData.end_date = endDate;
    }

    console.log('update', id, updateData);

    const { data, error } = await supabase.from('news_events').update(updateData).eq('id', id).select('id');
    console.log('response', data, error);
    if (error) {
      response.error = error.message;
      return Response.json(response, { status: 500 });
    }

    response.data = data[0];
    return Response.json(response);
  } catch (error) {
    console.error('Error updating news event:', error);
    response.error = 'Internal server error';
    return Response.json(response, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const response: FetchResponse<SimpleResponse> = {};

  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore, true);
    const body = await request.json();
    const { id } = await params;

    const { actor } = body;

    // Perform soft delete by updating deleted_at and deleted_by columns
    const updateData = {
      deleted_at: getNowDate(),
      deleted_by: actor,
      modified_by: actor,
      modified_at: getNowDate(),
    };

    const { data, error } = await supabase.from('news_events').update(updateData).eq('id', id).select('id');

    if (error) {
      response.error = error.message;
      return Response.json(response, { status: 500 });
    }

    if (data) {
      response.data = {
        id,
      };
    }
    return Response.json(response);
  } catch (error) {
    console.error('Error deleting news event:', error);
    response.error = 'Internal server error';
    return Response.json(response, { status: 500 });
  }
}
