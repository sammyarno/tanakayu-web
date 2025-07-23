import { useUserAuthStore, useUser, useAuthLoading, useAuthError } from '@/store/userAuthStore';
import { useEffect } from 'react';

// This hook maintains backward compatibility with the previous React Query implementation
// while using the new Zustand store under the hood
export const useFetchLoggedUser = () => {
  const { fetchUser } = useUserAuthStore();
  const user = useUser();
  const isLoading = useAuthLoading();
  const error = useAuthError();
  
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);
  
  return {
    data: user,
    isLoading,
    error,
    refetch: fetchUser,
  };
};

// Keep the original function for direct API calls if needed
export const fetchLoggedUser = async () => {
  const { fetchUser } = useUserAuthStore.getState();
  return fetchUser();
};
