import { authenticatedFetchJson } from '@/lib/fetch';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface DeleteAnnouncementRequest {
  id: string;
  actor: string;
}

const deleteAnnouncement = async (payload: DeleteAnnouncementRequest) => {
  const data = await authenticatedFetchJson(`/api/announcements/${payload.id}`, {
    method: 'DELETE',
    body: JSON.stringify({
      deletedBy: payload.actor,
    }),
  });

  return data.announcement;
};

export const useDeleteAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: DeleteAnnouncementRequest) => deleteAnnouncement(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
};
