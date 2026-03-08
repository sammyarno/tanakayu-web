import { authenticatedFetchJson } from '@/lib/fetch';
import type { PostType } from '@/types/post';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface CreatePostRequest {
  title: string;
  content: string;
  type: PostType;
  categoryIds?: string[];
  startDate?: string;
  endDate?: string;
}

const createPost = async (payload: CreatePostRequest) => {
  const { data, error } = await authenticatedFetchJson('/api/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: payload.title,
      content: payload.content,
      type: payload.type,
      categoryIds: payload.categoryIds,
      startDate: payload.startDate,
      endDate: payload.endDate,
    }),
  });

  if (error) {
    throw new Error(error);
  }

  return data;
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePostRequest) => createPost(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};
