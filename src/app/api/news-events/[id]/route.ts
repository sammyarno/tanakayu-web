import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

import { createServerClient } from '@/plugins/supabase/server';
import { getNowDate } from '@/utils/date';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);
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

    const { data, error } = await supabase.from('news_events').update(updateData).eq('id', id).select('id');

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ data });
  } catch (error) {
    console.error('Error updating news event:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);
    const body = await request.json();
    const { id } = await params;
    
    const { actor } = body;

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Perform soft delete by updating deleted_at and deleted_by columns
    const updateData = {
      deleted_at: getNowDate(),
      deleted_by: actor,
      modified_by: actor,
      modified_at: getNowDate(),
    };

    const { data, error } = await supabase
      .from('news_events')
      .update(updateData)
      .eq('id', id)
      .select('id');

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ data });
  } catch (error) {
    console.error('Error deleting news event:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
