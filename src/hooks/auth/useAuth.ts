import { useMemo } from 'react';

import { useUserAuthStore } from '@/store/userAuthStore';

export const useAuth = () => {
  const userInfo = useUserAuthStore(state => state.userInfo);
  const isLoading = useUserAuthStore(state => state.isLoading);
  const isInitialized = useUserAuthStore(state => state.isInitialized);
  const error = useUserAuthStore(state => state.error);
  const signIn = useUserAuthStore(state => state.signIn);
  const signOut = useUserAuthStore(state => state.signOut);
  const initialize = useUserAuthStore(state => state.initialize);
  const clearError = useUserAuthStore(state => state.clearError);

  return useMemo(
    () => ({
      user: userInfo,
      userId: userInfo?.id,
      username: userInfo?.username,
      role: userInfo?.role,
      isLoading,
      isInitialized,
      error,
      signIn,
      signOut,
      initialize,
      clearError,
    }),
    [userInfo, isLoading, isInitialized, error, signIn, signOut, initialize, clearError]
  );
};
