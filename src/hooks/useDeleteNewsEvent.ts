import { authenticatedFetchJson } from '@/lib/fetch';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const deleteNewsEvent = async ({ id }: { id: string }) => {
  const response = await authenticatedFetchJson(`/api/news-events/${id}`, {
    method: 'DELETE',
    body: JSON.stringify({}),
  });

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data;
};

export const useDeleteNewsEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { id: string }) => deleteNewsEvent(payload),
    onSuccess: () => {
      // Invalidate and refetch news events
      queryClient.invalidateQueries({ queryKey: ['news-events'] });
    },
  });
};
