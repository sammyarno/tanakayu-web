import { useState } from 'react';

export interface RefreshTokenResponse {
  jwt: string;
  refresh_token?: string;
}

export interface RefreshTokenError {
  error: string;
  details?: any;
}

export const useRefreshToken = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshToken = async (currentJwt?: string): Promise<RefreshTokenResponse | null> => {
    setIsRefreshing(true);
    setError(null);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Include current JWT if available for optimization
      if (currentJwt) {
        headers['Authorization'] = `Bearer ${currentJwt}`;
      }

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers,
        credentials: 'include', // Important for HttpOnly cookies
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to refresh token');
      }

      return data as RefreshTokenResponse;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh token';
      setError(errorMessage);
      return null;
    } finally {
      setIsRefreshing(false);
    }
  };

  const clearError = () => setError(null);

  return {
    refreshToken,
    isRefreshing,
    error,
    clearError,
  };
};