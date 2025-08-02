import { useUserAuthStore } from '@/store/userAuthStore';
import { useMemo } from 'react';

export const useAuth = () => {
  const storedUserData = useUserAuthStore(state => state.storedUserData);
  const isLoading = useUserAuthStore(state => state.isLoading);
  const isInitialized = useUserAuthStore(state => state.isInitialized);
  const error = useUserAuthStore(state => state.error);
  const signIn = useUserAuthStore(state => state.signIn);
  const signOut = useUserAuthStore(state => state.signOut);
  const fetchUser = useUserAuthStore(state => state.fetchUser);
  const clearError = useUserAuthStore(state => state.clearError);
  const updateUser = useUserAuthStore(state => state.updateUser);

  return useMemo(
    () => ({
      user: storedUserData,
      userId: storedUserData?.id,
      email: storedUserData?.email,
      displayName: storedUserData?.display_name,
      isLoading,
      isInitialized,
      error,
      signIn,
      signOut,
      fetchUser,
      clearError,
      updateUser,
    }),
    [
      storedUserData,
      isLoading,
      isInitialized,
      error,
      signIn,
      signOut,
      fetchUser,
      clearError,
      updateUser,
    ]
  );
};
