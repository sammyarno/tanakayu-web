import { useEffect } from 'react';

// import { usePathname } from 'next/navigation';

import { useAnnouncementCategoriesStore } from '@/store/announcementCategoriesStore';

import { useAuth } from './auth/useAuth';

export const useInitializeStores = () => {
  // const pathname = usePathname();
  const fetchAnnouncementCategories = useAnnouncementCategoriesStore(state => state.fetchCategories);
  const { initialize } = useAuth();

  useEffect(() => {
    fetchAnnouncementCategories();
    // Always initialize auth state - this ensures proper authentication
    // state management across all pages, including after login redirects
    initialize();
  }, [fetchAnnouncementCategories, initialize]);

  return null;
};
