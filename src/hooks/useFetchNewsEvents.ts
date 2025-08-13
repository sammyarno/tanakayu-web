import { fetchJson } from '@/lib/fetch';
import { NewsEventWithComment } from '@/types/news-event';
import { snakeToCamel } from '@/utils/transformer';
import { useQuery } from '@tanstack/react-query';

import { useAuth } from './auth/useAuth';

export const fetchNewsEvents = async (isAdmin = false): Promise<NewsEventWithComment[]> => {
  const response = await fetchJson(`/api/news-events?admin=${isAdmin}`);

  if (response.error) {
    throw new Error(response.error);
  }

  return snakeToCamel<NewsEventWithComment[]>(response.data) || [];
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
