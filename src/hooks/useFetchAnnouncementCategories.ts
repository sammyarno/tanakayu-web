import { fetchJson } from '@/lib/fetch';
import type { Category } from '@/types';
import { useQuery } from '@tanstack/react-query';

export const fetchAnnouncementCategories = async (): Promise<Category[]> => {
  const response = await fetchJson('/api/announcement-categories');

  if (response.error) {
    throw new Error(response.error || 'Failed to fetch announcement categories');
  }

  return response.data || [];
};

export const useAnnouncementCategories = () => {
  return useQuery({
    queryKey: ['announcement-categories'],
    queryFn: () => fetchAnnouncementCategories(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
