import { useEffect } from 'react';

import { usePathname } from 'next/navigation';

import { useAnnouncementCategoriesStore } from '@/store/announcementCategoriesStore';
import { useUserAuthStore } from '@/store/userAuthStore';

export const useInitializeStores = () => {
  const pathname = usePathname();
  const fetchAnnouncementCategories = useAnnouncementCategoriesStore(state => state.fetchCategories);
  const fetchUser = useUserAuthStore(state => state.fetchUser);

  useEffect(() => {
    fetchAnnouncementCategories();
    const isLoginPage = pathname.includes('/login');

    if (isLoginPage) {
      fetchUser(true);
    } else if (pathname.includes('/admin')) {
      fetchUser();
    }
  }, [fetchAnnouncementCategories, fetchUser, pathname]);

  return null;
};
