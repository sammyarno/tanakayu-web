import { fetchJson } from '@/lib/fetch';
import type { SimpleResponse } from '@/types/fetch';
import { useMutation } from '@tanstack/react-query';

export interface PostCommentRequest {
  comment: string;
  targetType: 'news_event' | 'announcement';
  targetId: string;
  actor: string;
}

const postComment = async (payload: PostCommentRequest) => {
  const response = await fetchJson<SimpleResponse>('/api/comments', {
    method: 'POST',
    body: JSON.stringify({
      comment: payload.comment,
      targetType: payload.targetType,
      targetId: payload.targetId,
      actor: payload.actor,
    }),
  });

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data;
};

export const usePostComment = () => {
  return useMutation({
    mutationKey: ['post-comment'],
    mutationFn: (payload: PostCommentRequest) => postComment(payload),
  });
};
