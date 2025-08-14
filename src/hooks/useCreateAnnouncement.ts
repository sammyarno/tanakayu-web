import { authenticatedFetchJson } from '@/lib/fetch';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface CreateAnnouncementRequest {
  title: string;
  content: string;
  categoryIds: string[];
  actor: string;
}

const createAnnouncement = async (payload: CreateAnnouncementRequest) => {
  const { data, error } = await authenticatedFetchJson('/api/announcements', {
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

  return useMutation({
    mutationFn: (payload: CreateAnnouncementRequest) => createAnnouncement(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
};
