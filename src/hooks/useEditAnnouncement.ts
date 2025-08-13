import { authenticatedFetchJson } from '@/lib/fetch';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface EditAnnouncementRequest {
  id: string;
  title?: string;
  content?: string;
  categories?: string[];
  actor: string;
}

const editAnnouncement = async (payload: EditAnnouncementRequest) => {
  const response = await authenticatedFetchJson(`/api/announcements/${payload.id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      title: payload.title,
      content: payload.content,
      categoryIds: payload.categories,
      actor: payload.actor,
    }),
  });

  if (response.error) {
    throw new Error(response.error || 'Failed to edit announcement');
  }

  return response.data || [];
};

export const useEditAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: EditAnnouncementRequest) => editAnnouncement(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
};
