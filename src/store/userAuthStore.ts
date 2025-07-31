import { getSupabaseClient } from '@/plugins/supabase/client';
import { LimitedUserData, fromLimitedUserData, toLimitedUserData } from '@/types/auth';
import { decryptData, encryptData } from '@/utils/encryption';
import { User } from '@supabase/supabase-js';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { getCurrentTimestamp } from './utils';

interface PersistedState {
  storedUserData: LimitedUserData | null;
  lastFetched: number | null;
}

interface UserAuthState extends PersistedState {
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  user: User | null;
  fetchUser: (isLoginPage?: boolean) => Promise<User | null>;
  signIn: (email: string, password: string) => Promise<User | null>;
  signOut: () => Promise<void>;
  clearError: () => void;
  updateUser: (user: User) => void;
}

const CACHE_DURATION = parseInt(process.env.NEXT_PUBLIC_AUTH_CACHE_DURATION || '300000', 10);

const encryptedStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (typeof window === 'undefined') return null;

    const str = localStorage.getItem(name);
    if (!str) return str;

    try {
      const data = await decryptData<PersistedState>(str);
      return data ? JSON.stringify(data) : null;
    } catch (e) {
      console.error('Failed to decrypt storage', e);
      return null;
    }
  },

  setItem: async (name: string, value: string): Promise<void> => {
    if (typeof window === 'undefined') return;

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
    if (typeof window === 'undefined') return;
    localStorage.removeItem(name);
  },
};

export const useUserAuthStore = create<UserAuthState>()(
  persist(
    (set, get) => {
      const initializeUser = async () => {
        const { storedUserData } = get();
        if (storedUserData) {
          const user = fromLimitedUserData(storedUserData) as User | null;
          set({ user, isInitialized: true });
        } else {
          // Check current session with Supabase when no cached data
          try {
            const client = getSupabaseClient();
            const { data, error } = await client.auth.getUser();

            if (data.user && !error) {
              const limitedData = toLimitedUserData(data.user);
              set({
                storedUserData: limitedData,
                user: data.user,
                lastFetched: getCurrentTimestamp(),
                isInitialized: true,
              });
            } else {
              set({ isInitialized: true });
            }
          } catch {
            set({ isInitialized: true });
          }
        }
      };

      // Call initialization after a brief delay to ensure persistence has loaded
      setTimeout(initializeUser, 0);

      return {
        storedUserData: null,
        lastFetched: null,
        isLoading: false,
        isInitialized: false,
        error: null,
        user: null,

        fetchUser: async (isLoginPage = false) => {
          const { lastFetched, storedUserData } = get();
          const currentTime = getCurrentTimestamp();

          // Return cached user if still valid
          if (storedUserData && lastFetched && currentTime - lastFetched < CACHE_DURATION) {
            const cachedUser = fromLimitedUserData(storedUserData) as User | null;
            set({ user: cachedUser });
            return cachedUser;
          }

          if (isLoginPage) {
            const currentUser = fromLimitedUserData(storedUserData) as User | null;
            set({ user: currentUser });
            return currentUser;
          }

          set({ isLoading: true, error: null });

          try {
            const client = getSupabaseClient();
            const { data, error } = await client.auth.getUser();

            if (error) throw new Error(error.message);

            // Convert to limited user data
            const limitedData = toLimitedUserData(data.user);

            set({
              storedUserData: limitedData,
              user: data.user,
              lastFetched: getCurrentTimestamp(),
              isLoading: false,
            });

            return data.user;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user';
            set({ error: errorMessage, isLoading: false, storedUserData: null, user: null });
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
              storedUserData: limitedData,
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
              storedUserData: null,
              user: null,
              lastFetched: null,
              isLoading: false,
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to sign out';
            set({ error: errorMessage, isLoading: false });
            // Still clear user data even if there's an error with the API
            set({ storedUserData: null, user: null, lastFetched: null });
          }
        },

        clearError: () => set({ error: null }),

        updateUser: (user: User) => {
          const limitedData = toLimitedUserData(user);
          set({
            storedUserData: limitedData,
            user,
            lastFetched: getCurrentTimestamp(),
          });
        },
      };
    },
    {
      name: 'user-auth-storage',
      storage: createJSONStorage(() => encryptedStorage),
      partialize: state => ({ storedUserData: state.storedUserData, lastFetched: state.lastFetched }),
    }
  )
);

export const useUser = () => useUserAuthStore(state => state.user);
export const useAuthLoading = () => useUserAuthStore(state => state.isLoading);
export const useAuthError = () => useUserAuthStore(state => state.error);
export const useAuthInitialized = () => useUserAuthStore(state => state.isInitialized);

export const useStoredUserData = () => useUserAuthStore(state => state.storedUserData);
export const useStoredUserId = () => useUserAuthStore(state => state.storedUserData?.id);
export const useStoredUserEmail = () => useUserAuthStore(state => state.storedUserData?.email);
export const useStoredUserDisplayName = () => useUserAuthStore(state => state.storedUserData?.display_name);
