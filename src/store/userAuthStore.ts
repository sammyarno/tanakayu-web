import type { User } from '@/types/auth';
import { decryptData, encryptData } from '@/utils/encryption';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface PersistedState {
  userInfo: User | null;
}

interface UserAuthState extends PersistedState {
  jwt: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  signIn: (username: string, password: string) => Promise<User | null>;
  signOut: () => Promise<void>;
  verify: (token: string) => Promise<User | null>;
  refreshToken: (silent?: boolean) => Promise<boolean>;
  updateUser: (user: Partial<User>) => void;
  clearError: () => void;
}

const encryptedStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (typeof window === 'undefined') return null;

    const str = localStorage.getItem(name);
    if (!str) return null;

    try {
      const data = await decryptData<string>(str);
      return data;
    } catch (e) {
      console.error('Failed to decrypt storage', e);
      return null;
    }
  },

  setItem: async (name: string, value: string): Promise<void> => {
    if (typeof window === 'undefined') return;

    try {
      const encrypted = await encryptData(value);
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
        const { isLoading, isInitialized } = get();

        // Prevent multiple simultaneous initialization calls
        if (isLoading || isInitialized) {
          return;
        }

        set({ isLoading: true });

        try {
          // Attempt to restore session via refresh token (http-only cookie)
          // Pass silent=true to avoid setting global error on initial load if no session exists
          const refreshed = await get().refreshToken(true);
          if (!refreshed) {
            // If refresh failed, we might still have persisted user info, but it's stale without a token
            // So we clear it to force re-login
            set({ jwt: null, userInfo: null });
          }
        } catch (error) {
          console.error('Failed to initialize auth:', error);
          set({ jwt: null, userInfo: null });
        } finally {
          set({ isLoading: false, isInitialized: true });
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

          // Fetch full user details using the new token
          const userResponse = await fetch('/api/auth/user', {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${loginData.jwt}`,
            },
          });

          if (!userResponse.ok) {
            throw new Error('Failed to fetch user details');
          }

          const userData = await userResponse.json();
          const user: User = {
            address: userData.user.address || '',
            email: userData.user.email || '',
            role: userData.user.role || '',
            id: userData.user.id || '',
            username: userData.user.username || '',
            displayName: userData.user.display_name || '',
            phone: userData.user.phone || '',
          };

          set({
            jwt: loginData.jwt,
            userInfo: user,
            isLoading: false,
          });

          return user;
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
          const user: User = {
            address: userData.user.address || '',
            email: userData.user.email || '',
            role: userData.user.role || '',
            id: userData.user.id || '',
            username: userData.user.username || '',
            displayName: userData.user.display_name || '',
            phone: userData.user.phone || '',
          };

          return user;
        } catch (error) {
          console.error('Token verification failed:', error);
          return null;
        }
      },

      refreshToken: async (silent = false) => {
        try {
          const response = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });

          if (!response.ok) {
            set({ jwt: null, userInfo: null, error: silent ? null : 'Session expired' });
            return false;
          }

          const data = await response.json();
          const { jwt: newJwt } = data;

          // Get full user info using the new token
          const userResponse = await fetch('/api/auth/user', {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${newJwt}`,
            },
          });

          if (userResponse.ok) {
            const response = await userResponse.json();
            const user: User = {
              address: response.user.address || '',
              email: response.user.email || '',
              role: response.user.role || '',
              id: response.user.id || '',
              username: response.user.username || '',
              displayName: response.user.display_name || '',
              phone: response.user.phone || '',
            };

            set({ jwt: newJwt, userInfo: user, error: null });
            return true;
          } else {
            set({ jwt: null, userInfo: null, error: silent ? null : 'Failed to get user info' });
            return false;
          }
        } catch (error) {
          console.error('Token refresh failed:', error);
          set({ jwt: null, userInfo: null, error: silent ? null : 'Token refresh failed' });
          return false;
        }
      },

      updateUser: (user: Partial<User>) => {
        set(state => ({
          userInfo: state.userInfo ? { ...state.userInfo, ...user } : null,
        }));
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'user-auth-storage',
      storage: createJSONStorage(() => encryptedStorage),
      partialize: state => ({
        userInfo: state.userInfo,
      }),
    }
  )
);
