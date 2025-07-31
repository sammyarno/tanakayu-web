import { createServerClient } from '@/plugins/supabase/server';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { getNowDate } from '@/utils/date';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);
    const body = await request.json();
    const { id } = params;
    
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
      return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('comments')
      .update(updateData)
      .eq('id', id)
      .select('id');

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ data });
  } catch (error) {
    console.error('Error moderating comment:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}