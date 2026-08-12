import type { FetchResponse } from '@/types/fetch';
import { snakeToCamel } from '@/utils/transformer';

export const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  return fetch(url, {
    ...options,
    credentials: 'include',
  });
};

const requestJson = async <T = any>(
  fetcher: (url: string, options: RequestInit) => Promise<Response>,
  url: string,
  options: RequestInit,
  forceJsonHeader: boolean
): Promise<FetchResponse<T>> => {
  const response = await fetcher(
    url,
    forceJsonHeader ? { ...options, headers: { ...options.headers, 'Content-Type': 'application/json' } } : options
  );

  const jsonResponse: FetchResponse<T> = await response.json();

  if (!response.ok && !jsonResponse.error) {
    return { error: `HTTP ${response.status}: Request failed` };
  }

  return snakeToCamel(jsonResponse);
};

export const fetchJson = <T = any>(url: string, options: RequestInit = {}): Promise<FetchResponse<T>> =>
  requestJson<T>(fetch, url, options, true);

export const authenticatedFetchJson = <T = any>(url: string, options: RequestInit = {}): Promise<FetchResponse<T>> =>
  requestJson<T>(authenticatedFetch, url, options, true);

// No forced JSON header - for requests like file uploads (FormData) where the
// browser must set its own Content-Type (multipart boundary).
export const authenticatedCustomFetch = <T = any>(url: string, options: RequestInit = {}): Promise<FetchResponse<T>> =>
  requestJson<T>(authenticatedFetch, url, options, false);
