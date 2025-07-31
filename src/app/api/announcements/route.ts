import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

import { createServerClient } from '@/plugins/supabase/server';
import { getNowDate } from '@/utils/date';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    const { data, error } = await supabase
      .from('announcements')
      .select(
        `
        id,
        title,
        content,
        created_at,
        created_by,
        announcement_category_map (
          announcement_categories (
            id,
            label,
            code
          )
        )
      `
      )
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    // Transform data
    const result = data.map(item => ({
      id: item.id,
      title: item.title,
      content: item.content,
      createdAt: item.created_at,
      createdBy: item.created_by,
      categories: item.announcement_category_map.map(c => ({
        id: c.announcement_categories.id,
        label: c.announcement_categories.label,
        code: c.announcement_categories.code,
      })),
    }));

    return Response.json({ announcements: result });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);
    const body = await request.json();

    const { title, content, categoryIds, actor } = body;

    // Validate input
    if (!title || !content || !categoryIds || !actor) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Insert the announcement
    const { data, error } = await supabase
      .from('announcements')
      .insert({
        title,
        content,
        created_at: getNowDate(),
        created_by: actor,
      })
      .select('id');

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return Response.json({ error: 'Failed to create announcement' }, { status: 500 });
    }

    const announcementId = data[0].id;

    // Insert category mappings
    const { error: categoryInsertError } = await supabase.from('announcement_category_map').insert(
      categoryIds.map((category_id: string) => ({
        announcement_id: announcementId,
        category_id,
        created_by: actor,
        created_at: getNowDate(),
      }))
    );

    if (categoryInsertError) {
      return Response.json({ error: categoryInsertError.message }, { status: 500 });
    }

    return Response.json({ data: data[0] });
  } catch (error) {
    console.error('Error creating announcement:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
