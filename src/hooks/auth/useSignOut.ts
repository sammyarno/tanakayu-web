import { useCallback } from 'react';

import { useRouter } from 'next/navigation';

import { useAuth } from './useAuth';

export const useSignOut = () => {
  const { signOut, isLoading, error } = useAuth();
  const router = useRouter();

  const handleSignOut = useCallback(async () => {
    await signOut();
    // router.push('/login');
  }, [signOut, router]);

  return {
    signOut: handleSignOut,
    isLoading,
    error,
  };
};
