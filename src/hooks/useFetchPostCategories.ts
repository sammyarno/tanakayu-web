import { fetchJson } from '@/lib/fetch';
import type { Category } from '@/types';
import { useQuery } from '@tanstack/react-query';

export const fetchPostCategories = async (): Promise<Category[]> => {
  const response = await fetchJson('/api/post-categories');

  if (response.error) {
    throw new Error(response.error || 'Failed to fetch post categories');
  }

  return response.data || [];
};

export const usePostCategories = () => {
  return useQuery({
    queryKey: ['post-categories'],
    queryFn: () => fetchPostCategories(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};
