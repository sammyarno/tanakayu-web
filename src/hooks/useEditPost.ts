import { authenticatedFetchJson } from '@/lib/fetch';
import type { PostType } from '@/types/post';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface EditPostRequest {
  id: string;
  title: string;
  content: string;
  type: PostType;
  categoryIds?: string[];
  startDate?: string | null;
  endDate?: string | null;
}

const editPost = async (payload: EditPostRequest) => {
  const response = await authenticatedFetchJson(`/api/posts/${payload.id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      title: payload.title,
      content: payload.content,
      type: payload.type,
      categoryIds: payload.categoryIds,
      startDate: payload.startDate,
      endDate: payload.endDate,
    }),
  });

  if (response.error) {
    throw new Error(response.error || 'Failed to edit post');
  }

  return response.data || [];
};

export const useEditPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: EditPostRequest) => editPost(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};
