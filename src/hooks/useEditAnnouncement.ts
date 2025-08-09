import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedFetch } from './auth/useAuthenticatedFetch';

export interface EditAnnouncementRequest {
  id: string;
  title?: string;
  content?: string;
  categories?: string[];
  actor: string;
}

const editAnnouncement = async (payload: EditAnnouncementRequest, authenticatedFetch: any) => {
  const { data, error } = await authenticatedFetch(`/api/announcements/${payload.id}`, {
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

  if (error) {
    throw new Error(error);
  }

  return data.announcement;
};

export const useEditAnnouncement = () => {
  const queryClient = useQueryClient();
  const { authenticatedFetch } = useAuthenticatedFetch();

  return useMutation({
    mutationFn: (payload: EditAnnouncementRequest) => editAnnouncement(payload, authenticatedFetch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
};
