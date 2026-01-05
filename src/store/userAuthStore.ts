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
  refreshToken: () => Promise<boolean>;
  updateUser: (user: Partial<User>) => void;
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
      // Ensure we only persist userInfo
      const toPersist = { userInfo: data.userInfo };
      const encrypted = await encryptData(toPersist);
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
          const persistedData = await encryptedStorage.getItem('user-auth-storage');
          if (persistedData) {
            const parsed = JSON.parse(persistedData);
            const { jwt, userInfo } = parsed.state || {};

        set({ isLoading: true });

        try {
          // Attempt to restore session via refresh token (http-only cookie)
          const refreshed = await get().refreshToken();
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
          const user = userData.user as User;

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

          // Verify endpoint returns minimal data, but for full session we prefer /api/auth/user
          // However, verify is often used just to check token validity.
          // Let's assume verify returns JwtUserData which is a subset of User,
          // but we want to return full User if possible.
          // For now, let's keep it simple: verify just checks validity.
          // If we need data, we should use the stored data or fetch /user.
          const userData = await response.json();
          return userData as User;
        } catch (error) {
          console.error('Token verification failed:', error);
          return null;
        }
      },

      refreshToken: async () => {
        try {
          const response = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });

          if (!response.ok) {
            set({ jwt: null, userInfo: null, error: 'Session expired' });
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
            set({ jwt: newJwt, userInfo: response.user, error: null });
            return true;
          } else {
            set({ jwt: null, userInfo: null, error: 'Failed to get user info' });
            return false;
          }
        } catch (error) {
          console.error('Token refresh failed:', error);
          set({ jwt: null, userInfo: null, error: 'Token refresh failed' });
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
