import { useUserAuthStore } from '@/store/userAuthStore';
import type { FetchResponse } from '@/types/fetch';
import { snakeToCamel } from '@/utils/transformer';

export const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const { jwt, refreshToken, signOut } = useUserAuthStore.getState();

  if (!jwt) {
    throw new Error('No authentication token available');
  }

  const makeRequest = (token: string): Promise<Response> => {
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
  };

  let response = await makeRequest(jwt);

  // try refresh once
  if (response.status === 401) {
    const refreshed = await refreshToken();
    console.log('refreshed', refreshed);

    if (refreshed) {
      // with new token
      const { jwt: newJwt } = useUserAuthStore.getState();
      if (newJwt) {
        response = await makeRequest(newJwt);
      }
    } else {
      // failed - sign out and redirect
      await signOut();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Error('Authentication failed - redirecting to login');
    }
  }

  return response;
};

export const authenticatedFetchJson = async <T = any>(
  url: string,
  options: RequestInit = {}
): Promise<FetchResponse<T>> => {
  const response = await authenticatedFetch(url, options);

  const jsonResponse: FetchResponse<T> = await response.json();

  if (!response.ok) {
    if (!jsonResponse.error) {
      return {
        error: `HTTP ${response.status}: Request failed`,
      };
    }
  }

  return snakeToCamel(jsonResponse);
};

export const fetchJson = async <T = any>(url: string, options: RequestInit = {}): Promise<FetchResponse<T>> => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
    },
  });

  const jsonResponse: FetchResponse<T> = await response.json();

  if (!response.ok) {
    if (!jsonResponse.error) {
      return {
        error: `HTTP ${response.status}: Request failed`,
      };
    }
  }

  return snakeToCamel(jsonResponse);
};

export const customFetch = async <T = any>(url: string, options: RequestInit = {}): Promise<FetchResponse<T>> => {
  const response = await fetch(url, {
    ...options,
  });

  const jsonResponse: FetchResponse<T> = await response.json();

  if (!response.ok) {
    if (!jsonResponse.error) {
      return {
        error: `HTTP ${response.status}: Request failed`,
      };
    }
  }

  return snakeToCamel(jsonResponse);
};
