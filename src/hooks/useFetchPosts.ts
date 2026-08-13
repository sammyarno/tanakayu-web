import { fetchJson } from '@/lib/fetch';
import type { PostWithVotes } from '@/types/post';
import { useQuery } from '@tanstack/react-query';

export const fetchPosts = async (): Promise<PostWithVotes[]> => {
  const response = await fetchJson(`/api/posts`);

  if (response.error) {
    throw new Error(response.error || 'Failed to fetch posts');
  }

  // fetchJson already applies snakeToCamel via the fetch utility
  return response.data || [];
};

// Deliberately not gated on the auth store: /api/posts reads the user from the
// session cookie server-side (for vote status), which the browser sends whether
// or not the store has finished initializing. Waiting on it only serialised the
// client-side profile fetch in front of this request.
export const usePosts = () =>
  useQuery({
    queryKey: ['posts'],
    queryFn: () => fetchPosts(),
  });
