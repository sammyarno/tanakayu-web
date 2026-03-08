import { getSupabaseClient } from '@/plugins/supabase/client';
import type { Category } from '@/types';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface PostCategoriesState {
  categories: Category[];
  isLoading: boolean;
  error: Error | null;
  lastFetched: number | null;
  fetchCategories: () => Promise<void>;
  getCategoryOptions: () => { value: string; label: string }[];
}

const fetchPostCategories = async (): Promise<Category[]> => {
  const client = getSupabaseClient();

  const { data, error } = await client.from('post_categories').select(
    `
      id,
      label,
      code
    `
  );

  if (error) throw new Error(error.message);

  return data.map(
    (item): Category => ({
      id: item.id,
      label: item.label,
      code: item.code,
    })
  );
};

const CACHE_TIME = 1000 * 60 * 30;

export const usePostCategoriesStore = create<PostCategoriesState>()(
  persist(
    (set, get) => ({
      categories: [],
      isLoading: false,
      error: null,
      lastFetched: null,

      fetchCategories: async () => {
        const { lastFetched } = get();
        const now = Date.now();

        if (lastFetched && now - lastFetched < CACHE_TIME && get().categories.length > 0) {
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const categories = await fetchPostCategories();
          set({
            categories,
            isLoading: false,
            lastFetched: Date.now(),
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error : new Error('Failed to fetch categories'),
            isLoading: false,
          });
        }
      },

      getCategoryOptions: () => {
        return get().categories.map(category => ({
          value: category.code,
          label: category.label,
        }));
      },
    }),
    {
      name: 'post-categories-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        categories: state.categories,
        lastFetched: state.lastFetched,
      }),
    }
  )
);

export const usePostCategories = () => {
  const store = usePostCategoriesStore();

  return {
    categories: store.categories,
    isLoading: store.isLoading,
    error: store.error,
    fetchCategories: store.fetchCategories,
    getCategoryOptions: store.getCategoryOptions,
  };
};
