import { fetchJson } from '@/lib/fetch';
import type { NearestEvent } from '@/types/post';
import { useQuery } from '@tanstack/react-query';

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
    staleTime: 1000 * 60 * 5,
  });
};
