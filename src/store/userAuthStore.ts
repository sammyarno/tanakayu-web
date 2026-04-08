import { getSupabaseClient } from '@/plugins/supabase/client';
import type { User, UserRole } from '@/types/auth';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface UserAuthState {
  userInfo: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  signIn: (username: string, password: string) => Promise<User | null>;
  signOut: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  clearError: () => void;
}

const fetchProfile = async (userId: string, email: string): Promise<User | null> => {
  const supabase = getSupabaseClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, full_name, phone_number, address, role')
    .eq('id', userId)
    .single();

  if (!profile) return null;

  return {
    id: userId,
    username: profile.username,
    email,
    displayName: profile.full_name,
    phone: profile.phone_number,
    address: profile.address,
    role: profile.role as UserRole,
  };
};

export const useUserAuthStore = create<UserAuthState>()(
  persist(
    (set, get) => ({
      userInfo: null,
      isLoading: false,
      isInitialized: false,
      error: null,

      initialize: async () => {
        const { isLoading, isInitialized } = get();
        if (isLoading || isInitialized) return;

        set({ isLoading: true });

        try {
          const supabase = getSupabaseClient();
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session) {
            const user = await fetchProfile(session.user.id, session.user.email || '');
            set({ userInfo: user });
          } else {
            set({ userInfo: null });
          }
        } catch (error) {
          console.error('Failed to initialize auth:', error);
          set({ userInfo: null });
        } finally {
          set({ isLoading: false, isInitialized: true });
        }
      },

      signIn: async (username: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
          const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

          // Call edge function for username-based login
          const response = await fetch(`${supabaseUrl}/functions/v1/login-with-username`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${supabaseAnonKey}`,
            },
            body: JSON.stringify({ username, password }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Failed to sign in');
          }

          // Set session in supabase client
          const supabase = getSupabaseClient();
          await supabase.auth.setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          });

          const user = await fetchProfile(data.session.user.id, data.session.user.email || '');

          set({ userInfo: user, isLoading: false });
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
          const supabase = getSupabaseClient();
          await supabase.auth.signOut();
          set({ userInfo: null, isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to sign out';
          set({ userInfo: null, isLoading: false, error: errorMessage });
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
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        userInfo: state.userInfo,
      }),
    }
  )
);
