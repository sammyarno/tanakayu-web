import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

import { createServerClient } from '@/plugins/supabase/server';
import { getNowDate } from '@/utils/date';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);
    const body = await request.json();
    const { id } = await params;

    const { title, content, categoryIds, actor } = body;

    // Validate input
    if (!title || !content || !categoryIds || !actor) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
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
      return Response.json({ error: error.message }, { status: 500 });
    }

    // Delete existing category mappings
    const { error: categoryError } = await supabase
      .from('announcement_category_map')
      .delete()
      .eq('announcement_id', id);

    if (categoryError) {
      return Response.json({ error: categoryError.message }, { status: 500 });
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
      return Response.json({ error: categoryInsertError.message }, { status: 500 });
    }

    return Response.json({ data });
  } catch (error) {
    console.error('Error updating announcement:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);
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
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ data });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
