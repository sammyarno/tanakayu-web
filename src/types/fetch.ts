export interface FetchResponse<T> {
  data?: T;
  error?: string;
}

export interface SimpleResponse {
  id: string;
}
