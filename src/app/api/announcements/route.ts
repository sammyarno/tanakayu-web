import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

import { createServerClient } from '@/plugins/supabase/server';
import type { Announcement } from '@/types/announcement';
import type { FetchResponse, SimpleResponse } from '@/types/fetch';
import { getNowDate } from '@/utils/date';

export async function GET() {
  const response: FetchResponse<Announcement[]> = {};

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
      response.error = error.message;
      return Response.json(response, { status: 500 });
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

    response.data = result;
    return Response.json(response);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    response.error = 'Internal server error';
    return Response.json(response, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const response: FetchResponse<SimpleResponse> = {};

  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore, true);
    const body = await request.json();

    const { title, content, categoryIds, actor } = body;

    // Validate input
    if (!title || !content || !categoryIds || !actor) {
      response.error = 'Missing required fields';
      return Response.json(response, { status: 400 });
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
      response.error = error.message;
      return Response.json(response, { status: 500 });
    }

    if (!data || data.length === 0) {
      response.error = 'Failed to create announcement';
      return Response.json(response, { status: 500 });
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
      response.error = categoryInsertError.message;
      return Response.json(response, { status: 500 });
    }

    response.data = data[0];
    return Response.json(response);
  } catch (error) {
    console.error('Error creating announcement:', error);
    response.error = 'Internal server error';
    return Response.json(response, { status: 500 });
  }
}
