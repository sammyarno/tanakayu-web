import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

import { createServerClient } from '@/plugins/supabase/server';
import type { FetchResponse, SimpleResponse } from '@/types/fetch';
import { getNowDate } from '@/utils/date';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const response: FetchResponse<SimpleResponse> = {};

  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore, true);
    const body = await request.json();
    const { id } = await params;

    const { title, content, categoryIds, actor } = body;

    // Validate input
    if (!title || !content || !categoryIds || !actor) {
      response.error = 'Missing required fields';
      return Response.json(response, { status: 400 });
    }

    // Update announcement
    const { data, error } = await supabase
      .from('announcements')
      .update({
        title,
        content,
        modified_at: getNowDate(),
        modified_by: actor,
      })
      .eq('id', id)
      .select('id');

    if (error) {
      response.error = error.message;
      return Response.json(response, { status: 500 });
    }

    // Delete existing category mappings
    const { error: categoryError } = await supabase
      .from('announcement_category_map')
      .delete()
      .eq('announcement_id', id);

    if (categoryError) {
      response.error = categoryError.message;
      return Response.json(response, { status: 500 });
    }

    // Insert new category mappings
    const { error: categoryInsertError } = await supabase.from('announcement_category_map').insert(
      categoryIds.map((category_id: string) => ({
        announcement_id: id,
        category_id,
        created_by: actor,
        created_at: getNowDate(),
      }))
    );

    if (categoryInsertError) {
      response.error = categoryInsertError.message;
      return Response.json(response, { status: 500 });
    }

    response.data = data[0];
    return Response.json(response);
  } catch (error) {
    console.error('Error updating announcement:', error);
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

    const { data, error } = await supabase
      .from('announcements')
      .update({
        deleted_at: getNowDate(),
        deleted_by: actor,
      })
      .eq('id', id)
      .select('id');

    if (error) {
      response.error = error.message;
      return Response.json(response, { status: 500 });
    }

    response.data = data[0];
    return Response.json(response);
  } catch (error) {
    console.error('Error deleting announcement:', error);
    response.error = 'Internal server error';
    return Response.json(response, { status: 500 });
  }
}
