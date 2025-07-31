import { useUser } from '@/store/userAuthStore';
import type { NewsEventWithComment } from '@/types';
import { useQuery } from '@tanstack/react-query';

export const fetchNewsEvents = async (isAdmin = false) => {
  const response = await fetch(`/api/news-events?admin=${isAdmin}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch news events');
  }
  
  const { newsEvents } = await response.json();
  return newsEvents as NewsEventWithComment[];
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
