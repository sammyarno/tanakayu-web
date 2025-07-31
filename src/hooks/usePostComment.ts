import { useMutation } from '@tanstack/react-query';

export interface PostCommentRequest {
  comment: string;
  targetType: 'news_event';
  targetId: string;
  createdBy: string;
}

const postComment = async (payload: PostCommentRequest) => {
  const response = await fetch('/api/comments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      comment: payload.comment,
      targetType: payload.targetType,
      targetId: payload.targetId,
      createdBy: payload.createdBy,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to post comment');
  }

  const { comment } = await response.json();
  return comment;
};

export const usePostComment = () => {
  return useMutation({
    mutationKey: ['post-comment'],
    mutationFn: postComment,
  });
};
