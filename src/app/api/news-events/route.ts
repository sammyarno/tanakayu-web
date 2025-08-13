import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

import { createServerClient } from '@/plugins/supabase/server';
import { Comment, NewsEventWithComment } from '@/types';
import { FetchResponse } from '@/types/fetch';

export async function GET(request: NextRequest) {
  const response: FetchResponse<NewsEventWithComment[]> = {};

  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);
    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get('admin') === 'true';

    // Fetch news events
    const { data: newsEvents, error: newsEventsError } = await supabase
      .from('news_events')
      .select('id, title, type, content, start_date, end_date, created_at, created_by')
      .is('deleted_at', null)
      .order('created_at', {
        ascending: false,
      });

    if (newsEventsError) {
      response.error = newsEventsError.message;
      return Response.json(response, { status: 500 });
    }

    // Fetch comments
    let commentsQuery = supabase
      .from('comments')
      .select(
        'id, comment, target_id, created_at, created_by, approved_at, approved_by, rejected_at, rejected_by, deleted_at, deleted_by'
      )
      .eq('target_type', 'news_event')
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
    const result: NewsEventWithComment[] = newsEvents.map(
      (event): NewsEventWithComment => ({
        ...event,
        createdAt: event.created_at,
        createdBy: event.created_by,
        startDate: event.start_date,
        endDate: event.end_date,
        comments: (comments || [])
          .filter(c => c.target_id === event.id)
          .map(
            (c): Comment => ({
              ...c,
              id: c.id,
              comment: c.comment,
              deletedAt: c.deleted_at || undefined,
              deletedBy: c.deleted_by || undefined,
              createdAt: c.created_at,
              createdBy: c.created_by,
              approvedAt: c.approved_at || undefined,
              approvedBy: c.approved_by || undefined,
              rejectedAt: c.rejected_at || undefined,
              rejectedBy: c.rejected_by || undefined,
            })
          ),
      })
    );

    response.data = result;

    return Response.json(response);
  } catch (error) {
    console.error('Error fetching news events:', error);
    response.error = 'Internal server error';
    return Response.json(response, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);
    const body = await request.json();

    const { title, content, type, startDate, endDate, actor } = body;

    const { data, error } = await supabase
      .from('news_events')
      .insert([
        {
          title,
          content,
          type,
          start_date: startDate,
          end_date: endDate,
          created_by: actor,
        },
      ])
      .select('id');

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ data });
  } catch (error) {
    console.error('Error creating news event:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
