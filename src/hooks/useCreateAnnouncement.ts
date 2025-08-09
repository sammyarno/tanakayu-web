import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedFetch } from './auth/useAuthenticatedFetch';

export interface CreateAnnouncementRequest {
  title: string;
  content: string;
  categoryIds: string[];
  actor: string;
}

const createAnnouncement = async (payload: CreateAnnouncementRequest, authenticatedFetch: any) => {
  const { data, error } = await authenticatedFetch('/api/announcements', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: payload.title,
      content: payload.content,
      categoryIds: payload.categoryIds,
      actor: payload.actor,
    }),
  });

  if (error) {
    throw new Error(error);
  }

  return data.announcement;
};

export const useCreateAnnouncement = () => {
  const queryClient = useQueryClient();
  const { authenticatedFetch } = useAuthenticatedFetch();

  return useMutation({
    mutationFn: (payload: CreateAnnouncementRequest) => createAnnouncement(payload, authenticatedFetch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
};
