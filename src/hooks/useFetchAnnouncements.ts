import { fetchJson } from '@/lib/fetch';
import type { Announcement } from '@/types/announcement';
import { useQuery } from '@tanstack/react-query';

import { useAuth } from './auth/useAuth';

export const fetchAnnouncements = async (isAdmin = false): Promise<Announcement[]> => {
  const response = await fetchJson(`/api/announcements?admin=${isAdmin}`);

  if (response.error) {
    throw new Error(response.error || 'Failed to fetch announcements');
  }

  return response.data || [];
};

export const useAnnouncements = () => {
  const { user } = useAuth();
  const isAdmin = !!user; // If user exists, they're an admin

  return useQuery({
    queryKey: ['announcements', { isAdmin }],
    queryFn: () => fetchAnnouncements(isAdmin),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
