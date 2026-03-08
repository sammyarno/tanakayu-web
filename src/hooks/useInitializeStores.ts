import { useEffect } from 'react';

// import { usePathname } from 'next/navigation';

import { usePostCategoriesStore } from '@/store/postCategoriesStore';

import { useAuth } from './auth/useAuth';

export const useInitializeStores = () => {
  const fetchPostCategories = usePostCategoriesStore(state => state.fetchCategories);
  const { initialize } = useAuth();

  useEffect(() => {
    fetchPostCategories();
    initialize();
  }, [fetchPostCategories, initialize]);

  return null;
};
