import type { Category } from '@/types';
import { useQuery } from '@tanstack/react-query';

export const fetchAnnouncementCategories = async () => {
  const response = await fetch('/api/announcement-categories');
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch announcement categories');
  }
  
  const { categories } = await response.json();
  return categories as Category[];
};

export const useAnnouncementCategories = () => {
  return useQuery({
    queryKey: ['announcement-categories'],
    queryFn: () => fetchAnnouncementCategories(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
