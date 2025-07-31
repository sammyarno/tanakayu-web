import { getQueryClient } from '@/plugins/react-query/client';
import { getSupabaseClient } from '@/plugins/supabase/client';
import { NewsEvent } from '@/types';
import { SupabaseClient } from '@supabase/supabase-js';
import { dehydrate, useQuery } from '@tanstack/react-query';

export const fetchNearestEvents = async (supaClient?: SupabaseClient) => {
  const client = supaClient ?? getSupabaseClient();
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await client
    .from('news_events')
    .select('id,title,type,content,start_date,end_date')
    .eq('type', 'event')
    .gte('start_date', today)
    .limit(2)
    .order('start_date', {
      ascending: true,
    });

  if (error) throw new Error(error.message);

  // transform data
  const result: NewsEvent[] = data.map(item => ({
    ...item,
    startDate: item.start_date,
    endDate: item.end_date,
  }));

  return result;
};

export const useNearestEvents = (supaClient?: SupabaseClient) => {
  return useQuery({
    queryKey: ['nearest-events'],
    queryFn: () => fetchNearestEvents(supaClient),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const prefetchNearestEvents = async (supaClient?: SupabaseClient) => {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['nearest-events'],
    queryFn: () => fetchNearestEvents(supaClient),
  });

  return dehydrate(queryClient);
};
