import { authenticatedFetchJson } from '@/lib/fetch';
import { User } from '@/types/auth';
import { useQuery } from '@tanstack/react-query';

export interface FetchProfileRequest {
  id: string;
  username: string;
}

const fetchProfile = async (payload: FetchProfileRequest) => {
  const response = await authenticatedFetchJson<User>(`/api/profile?id=${payload.id}&username=${payload.username}`, {
    method: 'GET',
  });

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data;
};

export const useFetchProfile = (payload: FetchProfileRequest) => {
  return useQuery({
    queryKey: ['profile', payload.id],
    queryFn: () => fetchProfile(payload),
    gcTime: 0,
    refetchOnWindowFocus: false,
    enabled: payload.id !== '' && payload.username !== '',
  });
};
