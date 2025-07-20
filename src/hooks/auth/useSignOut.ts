import { useCallback } from 'react';

import { useRouter } from 'next/navigation';

import { useUserAuthStore } from '@/store/userAuthStore';

export const useSignOut = () => {
  const { signOut, isLoading, error } = useUserAuthStore();
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
