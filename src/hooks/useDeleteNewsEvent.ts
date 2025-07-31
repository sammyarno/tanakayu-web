import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useDeleteNewsEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, actor }: { id: string; actor: string }) => {
      const response = await fetch(`/api/news-events/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ actor }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete news event');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch news events
      queryClient.invalidateQueries({ queryKey: ['news-events'] });
    },
  });
};