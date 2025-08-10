import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authenticatedFetchJson } from '@/utils/authenticatedFetch';

export interface EditAnnouncementRequest {
  id: string;
  title?: string;
  content?: string;
  categories?: string[];
  actor: string;
}

const editAnnouncement = async (payload: EditAnnouncementRequest) => {
  const data = await authenticatedFetchJson(`/api/announcements/${payload.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      title: payload.title,
      content: payload.content,
      categoryIds: payload.categories,
      actor: payload.actor,
    }),
  });

  return data.announcement;
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
