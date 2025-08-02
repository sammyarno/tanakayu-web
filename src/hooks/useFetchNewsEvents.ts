import type { NewsEventWithComment } from '@/types';
import { useQuery } from '@tanstack/react-query';

import { useAuth } from './auth/useAuth';

export const fetchNewsEvents = async (isAdmin = false) => {
  console.log('fetching news', isAdmin);
  const response = await fetch(`/api/news-events?admin=${isAdmin}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch news events');
  }

  const { newsEvents } = await response.json();
  return newsEvents as NewsEventWithComment[];
};

export const useNewsEvents = () => {
  const { user, isInitialized } = useAuth();
  const isAdmin = !!user;

  return useQuery({
    queryKey: ['news-events', { isAdmin }],
    queryFn: () => fetchNewsEvents(isAdmin),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    enabled: isInitialized,
  });
};
