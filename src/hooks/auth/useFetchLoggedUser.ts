import { useUserAuthStore } from '@/store/userAuthStore';
import { useEffect } from 'react';

// This hook maintains backward compatibility with the previous React Query implementation
// while using the new Zustand store under the hood
export const useFetchLoggedUser = () => {
  const { user, fetchUser, isLoading, error } = useUserAuthStore();
  
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
