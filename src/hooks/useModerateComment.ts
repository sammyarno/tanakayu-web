import { type NewsEventWithComment } from '@/types';
import { getNowDate } from '@/utils/date';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedFetch } from './auth/useAuthenticatedFetch';

export interface ModerateCommentRequest {
  commentId: string;
  action: 'approve' | 'reject' | 'delete';
  actor: string;
}

const moderateComment = async (payload: ModerateCommentRequest, authenticatedFetch: any) => {
  const { data, error } = await authenticatedFetch(`/api/comments/${payload.commentId}/moderate`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: payload.action,
      actor: payload.actor,
    }),
  });

  if (error) {
    throw new Error(error);
  }

  return data.comment;
};

export const useModerateComment = () => {
  const queryClient = useQueryClient();
  const { authenticatedFetch } = useAuthenticatedFetch();

  return useMutation({
    mutationFn: (payload: ModerateCommentRequest) => moderateComment(payload, authenticatedFetch),
    onSuccess: (_, variables) => {
      const currentTimestamp = getNowDate();
      const updateData: any = {};

      if (variables.action === 'approve') {
        updateData.approvedAt = currentTimestamp;
        updateData.approvedBy = variables.actor;
      } else if (variables.action === 'reject') {
        updateData.rejectedAt = currentTimestamp;
        updateData.rejectedBy = variables.actor;
      } else if (variables.action === 'delete') {
        updateData.deletedAt = currentTimestamp;
        updateData.deletedBy = variables.actor;
      }

      const updateCachedData = (oldData: NewsEventWithComment[]) => {
        if (!oldData) return oldData;

        return oldData.map(event => {
          const hasComment = event.comments?.some(comment => comment.id === variables.commentId);

          if (hasComment) {
            return {
              ...event,
              comments:
                variables.action === 'delete'
                  ? event.comments.filter(comment => comment.id !== variables.commentId)
                  : event.comments.map(comment => {
                      if (comment.id === variables.commentId) {
                        console.log('comment', comment, updateData);
                        return {
                          ...comment,
                          ...updateData,
                        };
                      }
                      return comment;
                    }),
            };
          }
          return event;
        });
      };

      queryClient.setQueryData(['news-events', { isAdmin: true }], updateCachedData);
    },
  });
};
