import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface EditAnnouncementRequest {
  id: string;
  title?: string;
  content?: string;
  categories?: string[];
  actor: string;
}

const editAnnouncement = async (payload: EditAnnouncementRequest) => {
  const response = await fetch(`/api/announcements/${payload.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: payload.title,
      content: payload.content,
      categoryIds: payload.categories,
      actor: payload.actor,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update announcement');
  }

  const { announcement } = await response.json();
  return announcement;
};

export const useEditAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['edit-announcement'],
    mutationFn: editAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
};
