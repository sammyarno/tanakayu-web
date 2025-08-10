import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authenticatedFetchJson } from '@/utils/authenticatedFetch';

interface CreateNewsEventParams {
  title: string;
  type: 'news' | 'event';
  content: string;
  startDate?: string;
  endDate?: string;
  actor: string;
}

const createNewsEvent = async (params: CreateNewsEventParams) => {
  const data = await authenticatedFetchJson('/api/news-events', {
    method: 'POST',
    body: JSON.stringify({
      title: params.title,
      type: params.type,
      content: params.content,
      startDate: params.startDate,
      endDate: params.endDate,
      actor: params.actor,
    }),
  });

  return data.newsEvent;
};

export const useCreateNewsEvent = () => {
  const queryClient = useQueryClient();


  return useMutation({
    mutationFn: (params: CreateNewsEventParams) => createNewsEvent(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-events'] });
    },
  });
};
