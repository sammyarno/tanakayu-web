import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authenticatedFetchJson } from '@/utils/authenticatedFetch';

const deleteNewsEvent = async ({ id, actor }: { id: string; actor: string }) => {
  return authenticatedFetchJson(`/api/news-events/${id}`, {
    method: 'DELETE',
    body: JSON.stringify({ actor }),
  });
};

export const useDeleteNewsEvent = () => {
  const queryClient = useQueryClient();


  return useMutation({
    mutationFn: (payload: { id: string; actor: string }) => deleteNewsEvent(payload),
    onSuccess: () => {
      // Invalidate and refetch news events
      queryClient.invalidateQueries({ queryKey: ['news-events'] });
    },
  });
};