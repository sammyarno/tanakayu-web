import { fetchJson } from '@/lib/fetch';
import type { PostWithComments } from '@/types/post';
import { snakeToCamel } from '@/utils/transformer';
import { useQuery } from '@tanstack/react-query';

import { useAuth } from './auth/useAuth';

export const fetchPosts = async (isAdmin = false): Promise<PostWithComments[]> => {
  const response = await fetchJson(`/api/posts?admin=${isAdmin}`);

  if (response.error) {
    throw new Error(response.error || 'Failed to fetch posts');
  }

  return snakeToCamel<PostWithComments[]>(response.data) || [];
};

export const usePosts = () => {
  const { user, isInitialized } = useAuth();
  const isAdmin = !!user;

  return useQuery({
    queryKey: ['posts', { isAdmin }],
    queryFn: () => fetchPosts(isAdmin),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    enabled: isInitialized,
  });
};
