import { useEffect } from 'react';

import { usePathname } from 'next/navigation';

import { useAnnouncementCategoriesStore } from '@/store/announcementCategoriesStore';

import { useAuth } from './auth/useAuth';

export const useInitializeStores = () => {
  const pathname = usePathname();
  const fetchAnnouncementCategories = useAnnouncementCategoriesStore(state => state.fetchCategories);
  const { initialize } = useAuth();

  useEffect(() => {
    fetchAnnouncementCategories();
    const isLoginPage = pathname.includes('/login');
    const isRegisterPage = pathname.includes('/register');

    if (!isLoginPage && !isRegisterPage) {
      initialize();
    }
  }, [fetchAnnouncementCategories, initialize, pathname]);

  return null;
};
