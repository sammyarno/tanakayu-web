import { getSupabaseClient } from '@/plugins/supabase/client';
import { User } from '@supabase/supabase-js';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { getCurrentTimestamp } from './utils';

interface UserAuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;

  // Actions
  fetchUser: (isLoginPage?: boolean) => Promise<User | null>;
  signIn: (email: string, password: string) => Promise<User | null>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

export const useUserAuthStore = create<UserAuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,
      lastFetched: null,

      fetchUser: async (isLoginPage = false) => {
        const { lastFetched, user } = get();
        const currentTime = getCurrentTimestamp();

        // Return cached user if still valid
        console.log(
          'isValid',
          lastFetched && lastFetched,
          currentTime,
          lastFetched && currentTime - lastFetched < CACHE_DURATION
        );
        if (user && lastFetched && currentTime - lastFetched < CACHE_DURATION) {
          return user;
        }

        // If we're on the login page, just return the current user state without fetching
        if (isLoginPage) {
          return user;
        }

        set({ isLoading: true, error: null });

        try {
          const client = getSupabaseClient();
          const { data, error } = await client.auth.getUser();

          if (error) throw new Error(error.message);

          set({
            user: data.user,
            lastFetched: getCurrentTimestamp(),
            isLoading: false,
          });

          return data.user;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user';
          set({ error: errorMessage, isLoading: false, user: null });
          return null;
        }
      },

      signIn: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          const client = getSupabaseClient();
          const { data, error } = await client.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw new Error(error.message);

          set({
            user: data.user,
            lastFetched: getCurrentTimestamp(),
            isLoading: false,
          });

          return data.user;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to sign in';
          set({ error: errorMessage, isLoading: false });
          return null;
        }
      },

      signOut: async () => {
        set({ isLoading: true, error: null });

        try {
          const client = getSupabaseClient();
          const { error } = await client.auth.signOut();

          if (error) throw new Error(error.message);

          set({
            user: null,
            lastFetched: null,
            isLoading: false,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to sign out';
          set({ error: errorMessage, isLoading: false });
          // Still clear user data even if there's an error with the API
          set({ user: null, lastFetched: null });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'user-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({ user: state.user, lastFetched: state.lastFetched }),
    }
  )
);

// Convenience hooks for common operations
export const useUser = () => useUserAuthStore(state => state.user);
export const useAuthLoading = () => useUserAuthStore(state => state.isLoading);
export const useAuthError = () => useUserAuthStore(state => state.error);
