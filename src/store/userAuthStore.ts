import { JwtUserData } from '@/types/auth';
import { decryptData, encryptData } from '@/utils/encryption';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface PersistedState {
  jwt: string | null;
  userInfo: JwtUserData | null;
}

interface UserAuthState extends PersistedState {
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  signIn: (username: string, password: string) => Promise<JwtUserData | null>;
  signOut: () => Promise<void>;
  verify: (token: string) => Promise<JwtUserData | null>;
  clearError: () => void;
}

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
    } catch {
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
      jwt: null,
      userInfo: null,
      isLoading: false,
      isInitialized: false,
      error: null,

      initialize: async () => {
        try {
          // Manually load persisted data from storage
          const persistedData = await encryptedStorage.getItem('user-auth-storage');
          if (persistedData) {
            const parsed = JSON.parse(persistedData);
            const { jwt } = parsed.state || {};

            if (jwt) {
              const verifiedUserData = await get().verify(jwt);
              if (verifiedUserData) {
                set({
                  jwt,
                  userInfo: verifiedUserData,
                });
              } else {
                set({
                  jwt: null,
                  userInfo: null,
                });
              }
            } else {
              set({
                jwt: null,
                userInfo: null,
              });
            }
          }
        } catch (error) {
          console.error('Failed to load persisted auth data:', error);
          set({
            jwt: null,
            userInfo: null,
          });
        } finally {
          set({ isInitialized: true });
        }
      },

      signIn: async (username: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          const loginResponse = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
          });

          const loginData = await loginResponse.json();

          if (!loginResponse.ok) {
            throw new Error(loginData?.error || 'Failed to sign in');
          }

          // Verify and decode the JWT to get user data
          const userData = await get().verify(loginData.jwt);
          if (!userData) {
            throw new Error('Invalid JWT received from server');
          }

          set({
            jwt: loginData.jwt,
            userInfo: userData,
            isLoading: false,
          });

          return loginData.user;
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
            jwt: null,
            userInfo: null,
            isLoading: false,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to sign out';
          set({ jwt: null, userInfo: null, isLoading: false, error: errorMessage });
        }
      },

      verify: async (token: string) => {
        try {
          const response = await fetch('/api/auth/verify', {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            return null;
          }

          const userData = await response.json();
          return userData as JwtUserData;
        } catch (error) {
          console.error('Token verification failed:', error);
          return null;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'user-auth-storage',
      storage: createJSONStorage(() => encryptedStorage),
      partialize: state => ({
        jwt: state.jwt,
      }),
    }
  )
);
