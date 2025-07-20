import { getSupabaseClient } from '@/plugins/supabase/client';
import { getNowDate } from '@/utils/date';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface DeleteAnnouncementRequest {
  id: string;
  actor: string;
}

const deleteAnnouncement = async (payload: DeleteAnnouncementRequest) => {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from('announcements')
    .update({
      deleted_at: getNowDate(),
      deleted_by: payload.actor,
    })
    .eq('id', payload.id)
    .select('id');

  if (error) throw new Error(error.message);

  return data;
};

export const useDeleteAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['delete-announcement'],
    mutationFn: deleteAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
};
