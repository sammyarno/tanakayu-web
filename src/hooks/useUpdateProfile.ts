import { authenticatedFetchJson } from '@/lib/fetch';
import { User } from '@/types/auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface UpdateProfileRequest {
  id: string;
  username?: string;
  full_name?: string;
  address?: string;
  email?: string;
  phone_number?: string;
  password?: string;
}

const updateProfile = async (payload: UpdateProfileRequest) => {
  const response = await authenticatedFetchJson<User>(`/api/profile/${payload.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: payload.username,
      full_name: payload.full_name,
      address: payload.address,
      email: payload.email,
      phone_number: payload.phone_number,
      password: payload.password,
    }),
  });

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data;
};

export const useUpdateProfile = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfileRequest) => updateProfile(payload),
    onSuccess: () => {
      // Invalidate and refetch user-related queries
      queryClient.invalidateQueries({ queryKey: ['profile', id] });
    },
  });
};
