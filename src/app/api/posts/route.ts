import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

import { createServerClient } from '@/plugins/supabase/server';
import { verifyAuth } from '@/lib/auth';
import type { FetchResponse, SimpleResponse } from '@/types/fetch';
import { getNowDate } from '@/utils/date';

export async function GET(request: NextRequest) {
  const response: FetchResponse<any[]> = {};

  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);
    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get('admin') === 'true';

    // Fetch posts with categories
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select(
        `
        id,
        title,
        content,
        type,
        start_date,
        end_date,
        created_at,
        created_by,
        post_category_map (
          post_categories (
            id,
            label,
            code
          )
        )
      `
      )
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (postsError) {
      response.error = postsError.message;
      return Response.json(response, { status: 500 });
    }

    // Fetch comments
    let commentsQuery = supabase
      .from('comments')
      .select(
        'id, comment, target_id, created_at, created_by, approved_at, approved_by, rejected_at, rejected_by, deleted_at, deleted_by'
      )
      .eq('target_type', 'post')
      .is('deleted_at', null);

    if (!isAdmin) {
      commentsQuery = commentsQuery.not('approved_at', 'is', null);
    }

    const { data: comments, error: commentError } = await commentsQuery;
    if (commentError) {
      response.error = commentError.message;
      return Response.json(response, { status: 500 });
    }

    // Transform data
    const result = posts.map(item => ({
      id: item.id,
      title: item.title,
      content: item.content,
      type: item.type,
      start_date: item.start_date,
      end_date: item.end_date,
      created_at: item.created_at,
      created_by: item.created_by,
      categories: item.post_category_map.map((c: any) => ({
        id: c.post_categories.id,
        label: c.post_categories.label,
        code: c.post_categories.code,
      })),
      comments: (comments || []).filter(c => c.target_id === item.id),
    }));

    response.data = result;
    return Response.json(response);
  } catch (error) {
    console.error('Error fetching posts:', error);
    response.error = 'Internal server error';
    return Response.json(response, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const response: FetchResponse<SimpleResponse> = {};

  try {
    const { user, error: authError } = await verifyAuth(request);
    if (authError) return authError;

    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore, true);
    const body = await request.json();

    const { title, content, type, categoryIds, startDate, endDate } = body;
    const actor = user!.username;

    if (!title || !content || !type) {
      response.error = 'Missing required fields';
      return Response.json(response, { status: 400 });
    }

    // Insert the post
    const { data, error } = await supabase
      .from('posts')
      .insert({
        title,
        content,
        type,
        start_date: startDate || null,
        end_date: endDate || null,
        created_at: getNowDate(),
        created_by: actor,
      })
      .select('id');

    if (error) {
      response.error = error.message;
      return Response.json(response, { status: 500 });
    }

    if (!data || data.length === 0) {
      response.error = 'Failed to create post';
      return Response.json(response, { status: 500 });
    }

    const postId = data[0].id;

    // Insert category mappings if provided
    if (categoryIds && categoryIds.length > 0) {
      const { error: categoryInsertError } = await supabase.from('post_category_map').insert(
        categoryIds.map((category_id: string) => ({
          post_id: postId,
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

    response.data = data[0];
    return Response.json(response);
  } catch (error) {
    console.error('Error creating post:', error);
    response.error = 'Internal server error';
    return Response.json(response, { status: 500 });
  }
}
