import { getSupabaseClient } from '@/plugins/supabase/client';
import { getNowDate } from '@/utils/date';
import { useMutation } from '@tanstack/react-query';

export interface ModerateCommentRequest {
  commentId: string;
  action: 'approve' | 'reject';
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
  }

  const { data, error } = await client.from('comments').update(updateData).eq('id', payload.commentId).select('id');

  if (error) throw new Error(error.message);

  return data;
};

export const useModerateComment = () => {
  return useMutation({
    mutationKey: ['moderate-comment'],
    mutationFn: moderateComment,
  });
};
