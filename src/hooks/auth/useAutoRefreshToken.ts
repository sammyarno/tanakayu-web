import { useCallback, useRef } from 'react';
import { useRefreshToken } from './useRefreshToken';

export interface AutoRefreshConfig {
  maxRetries?: number;
  onTokenRefreshed?: (newToken: string) => void;
  onRefreshFailed?: (error: string) => void;
}

export const useAutoRefreshToken = (config: AutoRefreshConfig = {}) => {
  const { maxRetries = 1, onTokenRefreshed, onRefreshFailed } = config;
  const { refreshToken, isRefreshing, error } = useRefreshToken();
  const retryCountRef = useRef(0);

  const fetchWithAutoRefresh = useCallback(
    async (
      url: string,
      options: RequestInit = {},
      currentJwt?: string
    ): Promise<Response> => {
      // Reset retry count for new requests
      retryCountRef.current = 0;

      const makeRequest = async (jwt?: string): Promise<Response> => {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        // Handle different header types
        if (options.headers) {
          if (options.headers instanceof Headers) {
            options.headers.forEach((value, key) => {
              headers[key] = value;
            });
          } else {
            Object.assign(headers, options.headers);
          }
        }

        if (jwt) {
          headers['Authorization'] = `Bearer ${jwt}`;
        }

        return fetch(url, {
          ...options,
          headers,
          credentials: 'include',
        });
      };

      // Initial request
      let response = await makeRequest(currentJwt);

      // If unauthorized and we haven't exceeded retry limit, try to refresh
      if (response.status === 401 && retryCountRef.current < maxRetries) {
        retryCountRef.current++;

        try {
          const refreshResult = await refreshToken(currentJwt);
          
          if (refreshResult?.jwt) {
            // Notify about successful token refresh
            onTokenRefreshed?.(refreshResult.jwt);
            
            // Retry the original request with new token
            response = await makeRequest(refreshResult.jwt);
          } else {
            onRefreshFailed?.('Failed to refresh token');
          }
        } catch (refreshError) {
          const errorMessage = refreshError instanceof Error 
            ? refreshError.message 
            : 'Token refresh failed';
          onRefreshFailed?.(errorMessage);
        }
      }

      return response;
    },
    [refreshToken, maxRetries, onTokenRefreshed, onRefreshFailed]
  );

  const fetchJsonWithAutoRefresh = useCallback(
    async <T = any>(
      url: string,
      options: RequestInit = {},
      currentJwt?: string
    ): Promise<{ data: T | null; error: string | null; response: Response }> => {
      try {
        const response = await fetchWithAutoRefresh(url, options, currentJwt);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          return {
            data: null,
            error: errorData.error || `HTTP ${response.status}`,
            response,
          };
        }

        const data = await response.json();
        return {
          data,
          error: null,
          response,
        };
      } catch (err) {
        return {
          data: null,
          error: err instanceof Error ? err.message : 'Network error',
          response: new Response(null, { status: 0 }),
        };
      }
    },
    [fetchWithAutoRefresh]
  );

  return {
    fetchWithAutoRefresh,
    fetchJsonWithAutoRefresh,
    isRefreshing,
    error,
  };
};