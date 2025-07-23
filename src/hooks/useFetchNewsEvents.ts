import { getSupabaseClient } from '@/plugins/supabase/client';
import { useUser } from '@/store/userAuthStore';
import type { Comment, NewsEventWithComment } from '@/types';
import { useQuery } from '@tanstack/react-query';

export const fetchNewsEvents = async (isAdmin = false) => {
  const client = getSupabaseClient();

  const { data: newsEvents, error: newsEventsError } = await client
    .from('news_events')
    .select('id, title, type, content, start_date, end_date, created_at, created_by')
    .order('created_at', {
      ascending: false,
    });
  if (newsEventsError) throw new Error(newsEventsError.message);

  let commentsQuery = client
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
  if (commentError) throw new Error(commentError.message);

  // transform data
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

  return result;
};

export const useNewsEvents = () => {
  const user = useUser();
  const isAdmin = !!user; // If user exists, they're an admin

  return useQuery({
    queryKey: ['news-events', { isAdmin }],
    queryFn: () => fetchNewsEvents(isAdmin),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
