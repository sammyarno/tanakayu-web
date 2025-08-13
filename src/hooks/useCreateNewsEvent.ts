import { authenticatedFetchJson } from '@/lib/fetch';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface CreateNewsEventParams {
  title: string;
  type: 'news' | 'event';
  content: string;
  startDate?: string;
  endDate?: string;
  actor: string;
}

const createNewsEvent = async (params: CreateNewsEventParams) => {
  const response = await authenticatedFetchJson('/api/news-events', {
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

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data;
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
