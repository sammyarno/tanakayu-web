import { getSupabaseClient } from '@/plugins/supabase/client';
import type { NewsEventWithComment } from '@/types';
import { getNowDate } from '@/utils/date';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface ModerateCommentRequest {
  commentId: string;
  action: 'approve' | 'reject' | 'delete';
  actor: string;
}

const moderateComment = async (payload: ModerateCommentRequest) => {
  const client = getSupabaseClient();

  const updateData: any = {};
  const currentTimestamp = getNowDate();

  if (payload.action === 'approve') {
    updateData.approved_at = currentTimestamp;
    updateData.approved_by = payload.actor;
  } else if (payload.action === 'reject') {
    updateData.rejected_at = currentTimestamp;
    updateData.rejected_by = payload.actor;
  } else if (payload.action === 'delete') {
    updateData.deleted_at = currentTimestamp;
    updateData.deleted_by = payload.actor;
  }

  const { data, error } = await client.from('comments').update(updateData).eq('id', payload.commentId).select('id');

  if (error) throw new Error(error.message);

  return data;
};

export const useModerateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['moderate-comment'],
    mutationFn: moderateComment,
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
