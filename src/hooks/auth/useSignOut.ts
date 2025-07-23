import { useCallback } from 'react';

import { useRouter } from 'next/navigation';

import { useUserAuthStore, useAuthLoading, useAuthError } from '@/store/userAuthStore';

export const useSignOut = () => {
  const { signOut } = useUserAuthStore();
  const isLoading = useAuthLoading();
  const error = useAuthError();
  const router = useRouter();

  const handleSignOut = useCallback(async () => {
    await signOut();
    router.push('/login');
  }, [signOut, router]);

  return {
    signOut: handleSignOut,
    isLoading,
    error,
  };
};
