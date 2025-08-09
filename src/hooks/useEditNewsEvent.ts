import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedFetch } from './auth/useAuthenticatedFetch';

export interface EditNewsEventRequest {
  id: string;
  title: string;
  content: string;
  type: string;
  startDate?: string | null;
  endDate?: string | null;
  actor: string;
}

const editNewsEvent = async (payload: EditNewsEventRequest, authenticatedFetch: any) => {
  const { data, error } = await authenticatedFetch(`/api/news-events/${payload.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: payload.title,
      content: payload.content,
      type: payload.type,
      startDate: payload.startDate,
      endDate: payload.endDate,
      actor: payload.actor,
    }),
  });

  if (error) {
    throw new Error(error);
  }

  return data.newsEvent;
};

export const useEditNewsEvent = () => {
  const queryClient = useQueryClient();
  const { authenticatedFetch } = useAuthenticatedFetch();

  return useMutation({
    mutationFn: (payload: EditNewsEventRequest) => editNewsEvent(payload, authenticatedFetch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-events'] });
    },
  });
};
