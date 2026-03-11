import { useCallback } from 'react';

import { useUserAuthStore } from '@/store/userAuthStore';
import { useShallow } from 'zustand/shallow';

export const useAuth = () => {
  const { userInfo, isLoading, isInitialized, error } = useUserAuthStore(
    useShallow(state => ({
      userInfo: state.userInfo,
      isLoading: state.isLoading,
      isInitialized: state.isInitialized,
      error: state.error,
    }))
  );

  const signIn = useUserAuthStore(state => state.signIn);
  const signOut = useUserAuthStore(state => state.signOut);
  const initialize = useUserAuthStore(state => state.initialize);
  const clearError = useUserAuthStore(state => state.clearError);
  const updateUser = useUserAuthStore(state => state.updateUser);

  return {
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
    updateUser,
  };
};
