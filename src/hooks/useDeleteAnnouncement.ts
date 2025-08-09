import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedFetch } from './auth/useAuthenticatedFetch';

export interface DeleteAnnouncementRequest {
  id: string;
  actor: string;
}

const deleteAnnouncement = async (payload: DeleteAnnouncementRequest, authenticatedFetch: any) => {
  const { data, error } = await authenticatedFetch(`/api/announcements/${payload.id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      deletedBy: payload.actor,
    }),
  });

  if (error) {
    throw new Error(error);
  }

  return data.announcement;
};

export const useDeleteAnnouncement = () => {
  const queryClient = useQueryClient();
  const { authenticatedFetch } = useAuthenticatedFetch();

  return useMutation({
    mutationFn: (payload: DeleteAnnouncementRequest) => deleteAnnouncement(payload, authenticatedFetch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
};
