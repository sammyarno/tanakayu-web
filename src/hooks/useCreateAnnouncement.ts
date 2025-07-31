import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface CreateAnnouncementRequest {
  title: string;
  content: string;
  categoryIds: string[];
  actor: string;
}

const createAnnouncement = async (payload: CreateAnnouncementRequest) => {
  const response = await fetch('/api/announcements', {
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

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create announcement');
  }

  const { announcement } = await response.json();
  return announcement;
};

export const useCreateAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['create-announcement'],
    mutationFn: createAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
};
