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
    .select('id, comment, target_id, created_at, created_by, approved_at, approved_by, rejected_at, rejected_by')
    .eq('target_type', 'news_event');

  // For non-admin users, only show approved comments
  if (!isAdmin) {
    commentsQuery = commentsQuery.not('approved_at', 'is', null).not('approved_by', 'is', null);
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

  console.log('user', user);

  return useQuery({
    queryKey: ['news-events', { isAdmin }],
    queryFn: () => fetchNewsEvents(isAdmin),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

// Special hook for admin view that always shows all comments
export const useAdminNewsEvents = () => {
  return useQuery({
    queryKey: ['admin-news-events'],
    queryFn: () => fetchNewsEvents(true),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

// Special hook for guest view that always shows only approved comments
export const useGuestNewsEvents = () => {
  return useQuery({
    queryKey: ['guest-news-events'],
    queryFn: () => fetchNewsEvents(false),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
