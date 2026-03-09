import { fetchJson } from '@/lib/fetch';
import type { PostWithVotes } from '@/types/post';
import { snakeToCamel } from '@/utils/transformer';
import { useQuery } from '@tanstack/react-query';

import { useAuth } from './auth/useAuth';

export const fetchPosts = async (): Promise<PostWithVotes[]> => {
  const response = await fetchJson(`/api/posts`);

  if (response.error) {
    throw new Error(response.error || 'Failed to fetch posts');
  }

  return snakeToCamel<PostWithVotes[]>(response.data) || [];
};

export const usePosts = () => {
  const { isInitialized } = useAuth();

  return useQuery({
    queryKey: ['posts'],
    queryFn: () => fetchPosts(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    enabled: isInitialized,
  });
};
