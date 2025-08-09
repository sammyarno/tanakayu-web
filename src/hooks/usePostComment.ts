import { useMutation } from '@tanstack/react-query';
import { useAuthenticatedFetch } from './auth/useAuthenticatedFetch';

export interface PostCommentRequest {
  comment: string;
  targetType: 'news_event' | 'announcement';
  targetId: string;
  actor: string;
}

const postComment = async (payload: PostCommentRequest, authenticatedFetch: any) => {
  const { data, error } = await authenticatedFetch('/api/comments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      comment: payload.comment,
      targetType: payload.targetType,
      targetId: payload.targetId,
      actor: payload.actor,
    }),
  });

  if (error) {
    throw new Error(error);
  }

  return data.comment;
};

export const usePostComment = () => {
  const { authenticatedFetch } = useAuthenticatedFetch();

  return useMutation({
    mutationKey: ['post-comment'],
    mutationFn: (payload: PostCommentRequest) => postComment(payload, authenticatedFetch),
  });
};
