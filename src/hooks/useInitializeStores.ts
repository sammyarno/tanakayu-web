import { useEffect } from 'react';

import { useAnnouncementCategoriesStore } from '@/store/announcementCategoriesStore';

export const useInitializeStores = () => {
  const fetchCategories = useAnnouncementCategoriesStore(state => state.fetchCategories);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return null;
};
