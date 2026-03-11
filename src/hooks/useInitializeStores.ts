import { useEffect, useRef } from 'react';

import { usePostCategoriesStore } from '@/store/postCategoriesStore';
import { useUserAuthStore } from '@/store/userAuthStore';

export const useInitializeStores = () => {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    usePostCategoriesStore.getState().fetchCategories();
    useUserAuthStore.getState().initialize();
  }, []);

  return null;
};
