import { LimitedUserData, toLimitedUserData } from '@/types/auth';
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
  fetchUser: (force?: boolean) => Promise<User | null>;
  signIn: (email: string, password: string) => Promise<User | null>;
  signOut: () => Promise<void>;
  clearError: () => void;
  updateUser: (user: User) => void;
}

const SESSION_TTL_MS = 1000 * 60 * 5; // 5 minutes

const encryptedStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (typeof window === 'undefined') return null;

    const str = localStorage.getItem(name);
    if (!str) return null;

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
      console.error('Encryption failed. Not storing data.');
    }
  },

  removeItem: (name: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(name);
  },
};

export const useUserAuthStore = create<UserAuthState>()(
  persist(
    (set, get) => ({
      storedUserData: null,
      lastFetched: null,
      isLoading: false,
      isInitialized: false,
      error: null,

      fetchUser: async (force = false) => {
        const { lastFetched } = get();

        if (!force && lastFetched && Date.now() - lastFetched < SESSION_TTL_MS) {
          return null;
        }

        set({ isLoading: true, error: null });

        try {
          const response = await fetch('/api/auth/user');
          const data = await response.json();

          if (!response.ok || !data?.user) {
            throw new Error('No user found');
          }

          const limitedData = toLimitedUserData(data.user);
          set({
            storedUserData: limitedData,
            lastFetched: getCurrentTimestamp(),
            isLoading: false,
          });

          return data.user;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user';
          set({ error: errorMessage, isLoading: false, storedUserData: null });
          return null;
        }
      },

      signIn: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          const data = await response.json();
          if (!response.ok) {
            throw new Error(data?.error || 'Failed to sign in');
          }

          const limitedData = toLimitedUserData(data.user);
          set({
            storedUserData: limitedData,
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
          const response = await fetch('/api/auth/logout', { method: 'POST' });

          if (!response.ok) {
            throw new Error('Failed to sign out');
          }

          set({
            storedUserData: null,
            lastFetched: null,
            isLoading: false,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to sign out';
          set({ storedUserData: null, lastFetched: null, isLoading: false, error: errorMessage });
        }
      },

      clearError: () => set({ error: null }),

      updateUser: (user: User) => {
        const limitedData = toLimitedUserData(user);
        set({
          storedUserData: limitedData,
          lastFetched: getCurrentTimestamp(),
        });
      },
    }),
    {
      name: 'user-auth-storage',
      storage: createJSONStorage(() => encryptedStorage),
      partialize: state => ({
        storedUserData: state.storedUserData,
        lastFetched: state.lastFetched,
      }),
      onRehydrateStorage: () => state => {
        state?.fetchUser?.();
      },
    }
  )
);
