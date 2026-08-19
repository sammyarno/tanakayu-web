import { useCallback } from 'react';

import { useAuth } from './useAuth';

export const useSignOut = () => {
  const { signOut, isLoading, error } = useAuth();

  const handleSignOut = useCallback(async () => {
    await signOut();
  }, [signOut]);

  return {
    signOut: handleSignOut,
    isLoading,
    error,
  };
};
