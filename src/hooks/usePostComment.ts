import { useMutation } from '@tanstack/react-query';
import { authenticatedFetchJson } from '@/utils/authenticatedFetch';

export interface PostCommentRequest {
  comment: string;
  targetType: 'news_event' | 'announcement';
  targetId: string;
  actor: string;
}

const postComment = async (payload: PostCommentRequest) => {
  const data = await authenticatedFetchJson('/api/comments', {
    method: 'POST',
    body: JSON.stringify({
      comment: payload.comment,
      targetType: payload.targetType,
      targetId: payload.targetId,
      actor: payload.actor,
    }),
  });

  return data.comment;
};

export const usePostComment = () => {


  return useMutation({
    mutationKey: ['post-comment'],
    mutationFn: (payload: PostCommentRequest) => postComment(payload),
  });
};
