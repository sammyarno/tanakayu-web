import { getQueryClient } from '@/plugins/react-query/client';
import { dehydrate, useQuery } from '@tanstack/react-query';

interface NearestEvent {
  id: string;
  title: string;
  type: string;
  content: string;
  start: string;
  end: string;
}

export const fetchNearestEvents = async (): Promise<NearestEvent[]> => {
  const response = await fetch('/api/events/nearest');
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch nearest events');
  }
  
  const { events } = await response.json();
  return events as NearestEvent[];
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
