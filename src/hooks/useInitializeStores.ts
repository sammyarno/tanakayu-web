import { useEffect } from 'react';

import { usePathname } from 'next/navigation';

import { useAnnouncementCategoriesStore } from '@/store/announcementCategoriesStore';

import { useAuth } from './auth/useAuth';

export const useInitializeStores = () => {
  const pathname = usePathname();
  const fetchAnnouncementCategories = useAnnouncementCategoriesStore(state => state.fetchCategories);
  const { fetchUser } = useAuth();

  useEffect(() => {
    fetchAnnouncementCategories();
    const isLoginPage = pathname.includes('/login');
    if (!isLoginPage) {
      fetchUser();
    }
  }, [fetchAnnouncementCategories, fetchUser, pathname]);

  return null;
};
