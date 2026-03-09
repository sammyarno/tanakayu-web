import type { FetchResponse } from '@/types/fetch';
import { snakeToCamel } from '@/utils/transformer';

export const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  return fetch(url, {
    ...options,
    credentials: 'include',
  });
};

export const authenticatedFetchJson = async <T = any>(
  url: string,
  options: RequestInit = {}
): Promise<FetchResponse<T>> => {
  const response = await authenticatedFetch(url, {
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

export const authenticatedCustomFetch = async <T = any>(
  url: string,
  options: RequestInit = {}
): Promise<FetchResponse<T>> => {
  const response = await authenticatedFetch(url, {
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
