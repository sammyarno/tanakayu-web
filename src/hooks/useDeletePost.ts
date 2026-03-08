import { authenticatedFetchJson } from '@/lib/fetch';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const deletePost = async ({ id }: { id: string }) => {
  const response = await authenticatedFetchJson(`/api/posts/${id}`, {
    method: 'DELETE',
    body: JSON.stringify({}),
  });

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data;
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { id: string }) => deletePost(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};
