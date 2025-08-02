'use client';

import { ReactNode, useEffect, useState } from 'react';

import { useAuth } from '@/hooks/auth/useAuth';
import { useInitializeStores } from '@/hooks/useInitializeStores';
import { getSupabaseClient } from '@/plugins/supabase/client';
import { useUserAuthStore } from '@/store/userAuthStore';
import { getCurrentTimestamp } from '@/store/utils';
import { toLimitedUserData } from '@/types/auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Component to initialize stores without affecting the component tree
function StoreInitializer() {
  useInitializeStores();
  return null;
}

// Component to handle auth state changes
function AuthStateHandler() {
  const { fetchUser } = useAuth();

  useEffect(() => {
    const supabase = getSupabaseClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          const limitedData = toLimitedUserData(session.user);
          useUserAuthStore.setState({
            storedUserData: limitedData,
            lastFetched: getCurrentTimestamp(),
            isLoading: false,
            error: null,
          });
        } else {
          await fetchUser();
        }
      } else if (event === 'SIGNED_OUT') {
        useUserAuthStore.setState({
          storedUserData: null,
          lastFetched: null,
          isLoading: false,
          error: null,
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUser]);

  return null;
}

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <StoreInitializer />
      <AuthStateHandler />
      {children}
    </QueryClientProvider>
  );
}
