import { getSupabaseClient } from '@/plugins/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface CreateNewsEventRequest {
  title: string;
  content: string;
  type: string;
  startDate?: string | null;
  endDate?: string | null;
  actor: string;
}

const createNewsEvent = async (payload: CreateNewsEventRequest) => {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from('news_events')
    .insert([
      {
        title: payload.title,
        content: payload.content,
        type: payload.type,
        start_date: payload.startDate,
        end_date: payload.endDate,
        created_by: payload.actor,
      },
    ])
    .select('id');

  if (error) throw new Error(error.message);

  return data;
};

export const useCreateNewsEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['create-news-event'],
    mutationFn: createNewsEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-events'] });
    },
  });
};
