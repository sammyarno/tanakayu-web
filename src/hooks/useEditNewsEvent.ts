import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface EditNewsEventRequest {
  id: string;
  title: string;
  content: string;
  type: string;
  startDate?: string | null;
  endDate?: string | null;
  actor: string;
}

const editNewsEvent = async (payload: EditNewsEventRequest) => {
  const response = await fetch(`/api/news-events/${payload.id}`, {
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

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update news event');
  }

  const { newsEvent } = await response.json();
  return newsEvent;
};

export const useEditNewsEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['edit-news-event'],
    mutationFn: editNewsEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-events'] });
    },
  });
};
