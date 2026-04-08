import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

import { createServerClient } from '@/plugins/supabase/server';
import { verifyAuth } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import type { FetchResponse, SimpleResponse } from '@/types/fetch';
import { getNowDate } from '@/utils/date';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const response: FetchResponse<SimpleResponse> = {};

  try {
    const { user, error: authError } = await verifyAuth(request);
    if (authError) return authError;

    if (user!.role !== 'SUPERADMIN') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore, true);
    const body = await request.json();
    const { id } = await params;

    const { title, content, type, categoryIds, startDate, endDate } = body;
    const actor = user!.username;

    if (!title || !content || !type) {
      response.error = 'Missing required fields';
      return Response.json(response, { status: 400 });
    }

    // Update post
    const { data, error } = await supabase
      .from('posts')
      .update({
        title,
        content,
        type,
        start_date: startDate || null,
        end_date: endDate || null,
        modified_at: getNowDate(),
        modified_by: actor,
      })
      .eq('id', id)
      .select('id');

    if (error) {
      response.error = error.message;
      return Response.json(response, { status: 500 });
    }

    // Update category mappings: delete existing then insert new
    await supabase.from('post_category_map').delete().eq('post_id', id);

    if (categoryIds && categoryIds.length > 0) {
      const { error: categoryInsertError } = await supabase.from('post_category_map').insert(
        categoryIds.map((category_id: string) => ({
          post_id: id,
          category_id,
          created_by: actor,
          created_at: getNowDate(),
        }))
      );

      if (categoryInsertError) {
        response.error = categoryInsertError.message;
        return Response.json(response, { status: 500 });
      }
    }

    await logAudit(supabase, {
      action: 'update',
      entityType: 'post',
      entityId: id,
      actor,
      metadata: { title, type },
    });

    response.data = data[0];
    return Response.json(response);
  } catch (error) {
    console.error('Error updating post:', error);
    response.error = 'Internal server error';
    return Response.json(response, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const response: FetchResponse<SimpleResponse> = {};

  try {
    const { user, error: authError } = await verifyAuth(request);
    if (authError) return authError;

    if (user!.role !== 'SUPERADMIN') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore, true);
    const { id } = await params;

    const actor = user!.username;

    const { data, error } = await supabase
      .from('posts')
      .update({
        deleted_at: getNowDate(),
        deleted_by: actor,
        modified_at: getNowDate(),
        modified_by: actor,
      })
      .eq('id', id)
      .select('id');

    if (error) {
      response.error = error.message;
      return Response.json(response, { status: 500 });
    }

    await logAudit(supabase, {
      action: 'delete',
      entityType: 'post',
      entityId: id,
      actor,
    });

    response.data = data?.[0] ?? { id };
    return Response.json(response);
  } catch (error) {
    console.error('Error deleting post:', error);
    response.error = 'Internal server error';
    return Response.json(response, { status: 500 });
  }
}
