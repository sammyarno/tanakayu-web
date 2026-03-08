import { authenticatedFetchJson } from '@/lib/fetch';
import type { SimpleResponse } from '@/types/fetch';
import type { PostWithComments } from '@/types/post';
import { getNowDate } from '@/utils/date';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface ModerateCommentRequest {
  commentId: string;
  action: 'approve' | 'reject' | 'delete';
}

const moderateComment = async (payload: ModerateCommentRequest) => {
  const response = await authenticatedFetchJson<SimpleResponse>(`/api/comments/${payload.commentId}/moderate`, {
    method: 'PATCH',
    body: JSON.stringify({
      action: payload.action,
    }),
  });

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data;
};

export const useModerateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ModerateCommentRequest) => moderateComment(payload),
    onSuccess: (_, variables) => {
      const currentTimestamp = getNowDate();
      const updateData: any = {};

      if (variables.action === 'approve') {
        updateData.approvedAt = currentTimestamp;
        // actor is now set by server, optimistic update just won't show the exact user
      } else if (variables.action === 'reject') {
        updateData.rejectedAt = currentTimestamp;
      } else if (variables.action === 'delete') {
        updateData.deletedAt = currentTimestamp;
      }

      const updateCachedData = (oldData: PostWithComments[]) => {
        if (!oldData) return oldData;

        return oldData.map(post => {
          const hasComment = post.comments?.some(comment => comment.id === variables.commentId);

          if (hasComment) {
            return {
              ...post,
              comments:
                variables.action === 'delete'
                  ? post.comments.filter(comment => comment.id !== variables.commentId)
                  : post.comments.map(comment => {
                      if (comment.id === variables.commentId) {
                        return {
                          ...comment,
                          ...updateData,
                        };
                      }
                      return comment;
                    }),
            };
          }
          return post;
        });
      };

      queryClient.setQueryData(['posts', { isAdmin: true }], updateCachedData);
    },
  });
};
