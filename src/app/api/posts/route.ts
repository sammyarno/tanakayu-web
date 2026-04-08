import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

import { createServerClient } from '@/plugins/supabase/server';
import { verifyAuth } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import type { FetchResponse, SimpleResponse } from '@/types/fetch';
import { getNowDate } from '@/utils/date';

export async function GET(request: NextRequest) {
  const response: FetchResponse<any[]> = {};

  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    // Try to get current user for vote status
    const { data: { user: authUser } } = await supabase.auth.getUser();
    const currentUserId = authUser?.id ?? null;

    // Fetch posts and all votes in parallel
    const [postsResult, votesResult] = await Promise.all([
      supabase
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
        .order('created_at', { ascending: false }),
      supabase
        .from('post_votes')
        .select('post_id, vote_type, user_id'),
    ]);

    if (postsResult.error) {
      response.error = postsResult.error.message;
      return Response.json(response, { status: 500 });
    }

    if (votesResult.error) {
      response.error = votesResult.error.message;
      return Response.json(response, { status: 500 });
    }

    const posts = postsResult.data;
    const votes = votesResult.data;
    const postIds = posts.map(p => p.id);

    // Build vote counts map
    const voteCounts = new Map<string, { upvotes: number; downvotes: number; userVote: string | null }>();
    for (const postId of postIds) {
      voteCounts.set(postId, { upvotes: 0, downvotes: 0, userVote: null });
    }
    for (const vote of votes || []) {
      const entry = voteCounts.get(vote.post_id)!;
      if (vote.vote_type === 'upvote') entry.upvotes++;
      else if (vote.vote_type === 'downvote') entry.downvotes++;
      if (currentUserId && vote.user_id === currentUserId) {
        entry.userVote = vote.vote_type;
      }
    }

    // Transform data
    const result = posts.map(item => {
      const vc = voteCounts.get(item.id) ?? { upvotes: 0, downvotes: 0, userVote: null };
      return {
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
        upvotes: vc.upvotes,
        downvotes: vc.downvotes,
        user_vote: vc.userVote,
      };
    });

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

    if (user!.role !== 'SUPERADMIN') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

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

    await logAudit(supabase, {
      action: 'create',
      entityType: 'post',
      entityId: postId,
      actor,
      metadata: { title, type },
    });

    response.data = data[0];
    return Response.json(response);
  } catch (error) {
    console.error('Error creating post:', error);
    response.error = 'Internal server error';
    return Response.json(response, { status: 500 });
  }
}
