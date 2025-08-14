import { authenticatedFetchJson } from '@/lib/fetch';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface DeleteAnnouncementRequest {
  id: string;
  actor: string;
}

const deleteAnnouncement = async (payload: DeleteAnnouncementRequest) => {
  const response = await authenticatedFetchJson(`/api/announcements/${payload.id}`, {
    method: 'DELETE',
    body: JSON.stringify({
      deletedBy: payload.actor,
    }),
  });

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data;
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
