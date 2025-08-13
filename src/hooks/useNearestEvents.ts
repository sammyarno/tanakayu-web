import { fetchJson } from '@/lib/fetch';
import { getQueryClient } from '@/plugins/react-query/client';
import type { NearestEvent } from '@/types/news-event';
import { dehydrate, useQuery } from '@tanstack/react-query';

export const fetchNearestEvents = async (): Promise<NearestEvent[]> => {
  const response = await fetchJson<NearestEvent[]>('/api/events/nearest');

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data || [];
};

export const useNearestEvents = () => {
  return useQuery({
    queryKey: ['nearest-events'],
    queryFn: fetchNearestEvents,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const prefetchNearestEvents = async () => {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['nearest-events'],
    queryFn: fetchNearestEvents,
  });

  return dehydrate(queryClient);
};
