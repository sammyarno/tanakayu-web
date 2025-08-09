import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedFetch } from './auth/useAuthenticatedFetch';

interface CreateNewsEventParams {
  title: string;
  type: 'news' | 'event';
  content: string;
  startDate?: string;
  endDate?: string;
  actor: string;
}

const createNewsEvent = async (params: CreateNewsEventParams, authenticatedFetch: any) => {
  const { data, error } = await authenticatedFetch('/api/news-events', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: params.title,
      type: params.type,
      content: params.content,
      startDate: params.startDate,
      endDate: params.endDate,
      actor: params.actor,
    }),
  });

  if (error) {
    throw new Error(error);
  }

  return data.newsEvent;
};

export const useCreateNewsEvent = () => {
  const queryClient = useQueryClient();
  const { authenticatedFetch } = useAuthenticatedFetch();

  return useMutation({
    mutationFn: (params: CreateNewsEventParams) => createNewsEvent(params, authenticatedFetch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-events'] });
    },
  });
};
