import { useCallback } from 'react';
import { useAutoRefreshToken } from './useAutoRefreshToken';
import { useUserAuthStore } from '@/store/userAuthStore';

/**
 * A hook that provides an authenticated fetch function with automatic token refresh.
 * This is a practical example of how to use the refresh token functionality.
 */
export const useAuthenticatedFetch = () => {
  const { fetchJsonWithAutoRefresh, isRefreshing, error } = useAutoRefreshToken({
    maxRetries: 1,
    onTokenRefreshed: (newToken) => {
      console.log('Token refreshed successfully:', newToken);
      // You could store the new token in a global state if needed
    },
    onRefreshFailed: (error) => {
      console.error('Token refresh failed:', error);
      // Optionally sign out the user or redirect to login
      useUserAuthStore.getState().signOut();
    },
  });

  const authenticatedFetch = useCallback(
    async <T = any>(
      url: string,
      options: RequestInit = {},
      currentJwt?: string
    ) => {
      return fetchJsonWithAutoRefresh<T>(url, options, currentJwt);
    },
    [fetchJsonWithAutoRefresh]
  );

  return {
    authenticatedFetch,
    isRefreshing,
    error,
  };
};