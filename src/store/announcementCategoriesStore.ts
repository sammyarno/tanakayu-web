import { getSupabaseClient } from '@/plugins/supabase/client';
import type { Category } from '@/types';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AnnouncementCategoriesState {
  // State
  categories: Category[];
  isLoading: boolean;
  error: Error | null;
  lastFetched: number | null;

  // Actions
  fetchCategories: () => Promise<void>;
  getCategoryOptions: () => { value: string; label: string }[];
}

// Fetch function extracted to be reusable
const fetchAnnouncementCategories = async (): Promise<Category[]> => {
  const client = getSupabaseClient();

  const { data, error } = await client.from('announcement_categories').select(
    `
      id,
      label,
      code
    `
  );

  if (error) throw new Error(error.message);

  // transform data
  const result: Category[] = data.map(
    (item): Category => ({
      id: item.id,
      label: item.label,
      code: item.code,
    })
  );

  return result;
};

// 30 minutes in milliseconds for cache invalidation
const CACHE_TIME = 1000 * 60 * 30;

export const useAnnouncementCategoriesStore = create<AnnouncementCategoriesState>()(
  persist(
    (set, get) => ({
      // Initial state
      categories: [],
      isLoading: false,
      error: null,
      lastFetched: null,

      // Actions
      fetchCategories: async () => {
        const { lastFetched } = get();
        const now = Date.now();

        // Return cached data if it's still fresh
        if (lastFetched && now - lastFetched < CACHE_TIME && get().categories.length > 0) {
          return;
        }

        // Otherwise fetch fresh data
        set({ isLoading: true, error: null });

        try {
          const categories = await fetchAnnouncementCategories();
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

      // Helper to get categories in the format needed for MultiSelect
      getCategoryOptions: () => {
        return get().categories.map(category => ({
          value: category.code,
          label: category.label,
        }));
      },
    }),
    {
      name: 'announcement-categories-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist the categories and lastFetched
      partialize: state => ({
        categories: state.categories,
        lastFetched: state.lastFetched,
      }),
    }
  )
);

// Hook for easier use in components
export const useAnnouncementCategories = () => {
  const store = useAnnouncementCategoriesStore();

  return {
    categories: store.categories,
    isLoading: store.isLoading,
    error: store.error,
    fetchCategories: store.fetchCategories,
    getCategoryOptions: store.getCategoryOptions,
  };
};
