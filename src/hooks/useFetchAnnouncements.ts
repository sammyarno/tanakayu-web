import { useUser } from '@/store/userAuthStore';
import type { Announcement } from '@/types';
import { useQuery } from '@tanstack/react-query';

export const fetchAnnouncements = async (isAdmin = false) => {
  const response = await fetch(`/api/announcements?admin=${isAdmin}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch announcements');
  }
  
  const { announcements } = await response.json();
  return announcements as Announcement[];
};

export const useAnnouncements = () => {
  const user = useUser();
  const isAdmin = !!user; // If user exists, they're an admin

  return useQuery({
    queryKey: ['announcements', { isAdmin }],
    queryFn: () => fetchAnnouncements(isAdmin),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
