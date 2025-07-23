import { getSupabaseClient } from '@/plugins/supabase/client';
import { LimitedUserData, fromLimitedUserData, toLimitedUserData } from '@/types/auth';
import { decryptData, encryptData } from '@/utils/encryption';
import { User } from '@supabase/supabase-js';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { getCurrentTimestamp } from './utils';

// State that will be persisted (encrypted)
interface PersistedState {
  userData: LimitedUserData | null;
  lastFetched: number | null;
}

// Full state including non-persisted elements
interface UserAuthState extends PersistedState {
  // Runtime-only state (not persisted)
  isLoading: boolean;
  error: string | null;

  // Computed property to provide compatibility with existing code
  user: User | null;

  // Actions
  fetchUser: (isLoginPage?: boolean) => Promise<User | null>;
  signIn: (email: string, password: string) => Promise<User | null>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const CACHE_DURATION = parseInt(process.env.NEXT_PUBLIC_AUTH_CACHE_DURATION || '300000', 10);

// Custom storage with encryption
const encryptedStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const str = localStorage.getItem(name);
    if (!str) return str;

    try {
      // For persisted state, decrypt it
      const data = await decryptData<PersistedState>(str);
      return data ? JSON.stringify(data) : null;
    } catch (e) {
      console.error('Failed to decrypt storage', e);
      return null;
    }
  },

  setItem: async (name: string, value: string): Promise<void> => {
    try {
      const data = JSON.parse(value) as PersistedState;
      const encrypted = await encryptData(data);
      localStorage.setItem(name, encrypted);
    } catch (e) {
      console.error('Failed to encrypt storage', e);
      localStorage.setItem(name, value);
    }
  },

  removeItem: (name: string): void => {
    localStorage.removeItem(name);
  },
};

export const useUserAuthStore = create<UserAuthState>()(
  persist(
    (set, get) => ({
      // Persisted state
      userData: null,
      lastFetched: null,

      // Runtime-only state
      isLoading: false,
      error: null,

      // Computed property that converts limited data to User object for compatibility
      get user() {
        return fromLimitedUserData(get().userData) as User | null;
      },

      fetchUser: async (isLoginPage = false) => {
        const { lastFetched, userData } = get();
        const currentTime = getCurrentTimestamp();

        // Return cached user if still valid
        if (userData && lastFetched && currentTime - lastFetched < CACHE_DURATION) {
          return fromLimitedUserData(userData) as User | null;
        }

        // If we're on the login page, just return the current user state without fetching
        if (isLoginPage) {
          return fromLimitedUserData(userData) as User | null;
        }

        set({ isLoading: true, error: null });

        try {
          const client = getSupabaseClient();
          const { data, error } = await client.auth.getUser();

          if (error) throw new Error(error.message);

          // Convert to limited user data
          const limitedData = toLimitedUserData(data.user);

          set({
            userData: limitedData,
            lastFetched: getCurrentTimestamp(),
            isLoading: false,
          });

          return data.user;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user';
          set({ error: errorMessage, isLoading: false, userData: null });
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

          // Convert to limited user data
          const limitedData = toLimitedUserData(data.user);

          set({
            userData: limitedData,
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
            userData: null,
            lastFetched: null,
            isLoading: false,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to sign out';
          set({ error: errorMessage, isLoading: false });
          // Still clear user data even if there's an error with the API
          set({ userData: null, lastFetched: null });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'user-auth-storage',
      storage: createJSONStorage(() => encryptedStorage),
      partialize: state => ({ userData: state.userData, lastFetched: state.lastFetched }),
    }
  )
);

// Convenience hooks for common operations
export const useUser = () => useUserAuthStore(state => state.user);
export const useAuthLoading = () => useUserAuthStore(state => state.isLoading);
export const useAuthError = () => useUserAuthStore(state => state.error);

// New hooks for accessing the limited user data directly
export const useLimitedUserData = () => useUserAuthStore(state => state.userData);
export const useUserId = () => useUserAuthStore(state => state.userData?.id);
export const useUserEmail = () => useUserAuthStore(state => state.userData?.email);
export const useUserDisplayName = () => useUserAuthStore(state => state.userData?.display_name);
