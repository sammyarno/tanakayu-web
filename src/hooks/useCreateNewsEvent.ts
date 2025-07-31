import { useMutation, useQueryClient } from '@tanstack/react-query';

interface CreateNewsEventParams {
  title: string;
  type: 'news' | 'event';
  content: string;
  startDate?: string;
  endDate?: string;
  actor: string;
}

export const useCreateNewsEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateNewsEventParams) => {
      const response = await fetch('/api/news-events', {
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

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create news event');
      }

      const { newsEvent } = await response.json();
      return newsEvent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-events'] });
    },
  });
};
