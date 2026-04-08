import { fetchJson } from '@/lib/fetch';
import type { PostWithVotes } from '@/types/post';
import { useQuery } from '@tanstack/react-query';

import { useAuth } from './auth/useAuth';

export const fetchPosts = async (): Promise<PostWithVotes[]> => {
  const response = await fetchJson(`/api/posts`);

  if (response.error) {
    throw new Error(response.error || 'Failed to fetch posts');
  }

  // fetchJson already applies snakeToCamel via the fetch utility
  return response.data || [];
};

export const usePosts = () => {
  const { isInitialized } = useAuth();

  return useQuery({
    queryKey: ['posts'],
    queryFn: () => fetchPosts(),
    enabled: isInitialized,
  });
};
