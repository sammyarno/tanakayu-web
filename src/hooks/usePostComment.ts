import { getSupabaseClient } from '@/plugins/supabase/client';
import { useMutation } from '@tanstack/react-query';

export interface PostCommentRequest {
  targetID: string;
  targetType: string;
  comment: string;
  actor: string;
}

const postComment = async (payload: PostCommentRequest) => {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from('comments')
    .insert([
      {
        comment: payload.comment,
        created_by: payload.actor,
        target_id: payload.targetID,
        target_type: payload.targetType,
      },
    ])
    .select('id');

  if (error) throw new Error(error.message);

  return data;
};

export const usePostComment = () => {
  return useMutation({
    mutationKey: ['post-comment'],
    mutationFn: postComment,
  });
};
