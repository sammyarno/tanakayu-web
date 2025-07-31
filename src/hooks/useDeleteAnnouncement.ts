import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface DeleteAnnouncementRequest {
  id: string;
  actor: string;
}

const deleteAnnouncement = async (payload: DeleteAnnouncementRequest) => {
  const response = await fetch(`/api/announcements/${payload.id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      deletedBy: payload.actor,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete announcement');
  }

  const { announcement } = await response.json();
  return announcement;
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
