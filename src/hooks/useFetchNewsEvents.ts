import { getSupabaseClient } from '@/plugins/supabase/client';
import type { Comment, NewsEventWithComment } from '@/types';
import { useQuery } from '@tanstack/react-query';

export const fetchNewsEvents = async () => {
  const client = getSupabaseClient();

  const { data: newsEvents, error: newsEventsError } = await client
    .from('news_events')
    .select('id, title, type, content, start_date, end_date, created_at, created_by')
    .order('created_at', {
      ascending: false,
    });
  if (newsEventsError) throw new Error(newsEventsError.message);

  const { data: comments, error: commentError } = await client
    .from('comments')
    .select('id, comment, target_id, created_at, created_by')
    .eq('target_type', 'news_event')
    .not('approved_at', 'is', null)
    .not('approved_by', 'is', null);
  if (commentError) throw new Error(commentError.message);

  // transform data
  const result: NewsEventWithComment[] = newsEvents.map(
    (event): NewsEventWithComment => ({
      ...event,
      createdAt: event.created_at,
      createdBy: event.created_by,
      startDate: event.start_date,
      endDate: event.end_date,
      comments: comments
        .filter(c => c.target_id === event.id)
        .map(
          (c): Comment => ({
            ...c,
            createdAt: c.created_at,
            createdBy: c.created_by,
          })
        ),
    })
  );

  return result;
};

export const useNewsEvents = () => {
  return useQuery({
    queryKey: ['news-events'],
    queryFn: () => fetchNewsEvents(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
