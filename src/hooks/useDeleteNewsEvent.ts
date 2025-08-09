import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedFetch } from './auth/useAuthenticatedFetch';

const deleteNewsEvent = async ({ id, actor }: { id: string; actor: string }, authenticatedFetch: any) => {
  const { data, error } = await authenticatedFetch(`/api/news-events/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ actor }),
  });

  if (error) {
    throw new Error(error);
  }

  return data;
};

export const useDeleteNewsEvent = () => {
  const queryClient = useQueryClient();
  const { authenticatedFetch } = useAuthenticatedFetch();

  return useMutation({
    mutationFn: (payload: { id: string; actor: string }) => deleteNewsEvent(payload, authenticatedFetch),
    onSuccess: () => {
      // Invalidate and refetch news events
      queryClient.invalidateQueries({ queryKey: ['news-events'] });
    },
  });
};