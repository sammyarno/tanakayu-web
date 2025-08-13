import { authenticatedFetchJson } from '@/lib/fetch';
import type { User } from '@/types/auth';
import type { UpdateProfileRequest } from '@/types/profile';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const updateProfile = async (payload: UpdateProfileRequest) => {
  const response = await authenticatedFetchJson<User>(`/api/profile/${payload.id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      username: payload.username,
      full_name: payload.fullName,
      address: payload.address,
      email: payload.email,
      phone_number: payload.phoneNumber,
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
