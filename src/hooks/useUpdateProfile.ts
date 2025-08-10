import { useMutation, useQueryClient } from '@tanstack/react-query';

import { authenticatedFetchJson } from '@/utils/authenticatedFetch';

export interface UpdateProfileRequest {
  displayName?: string;
  email?: string;
  password?: string;
}

const updateProfile = async (payload: UpdateProfileRequest) => {
  const { data, error } = await authenticatedFetchJson('/api/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      displayName: payload.displayName,
      email: payload.email,
      password: payload.password,
    }),
  });

  if (error) {
    throw new Error(error);
  }

  return data.user;
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();


  return useMutation({
    mutationFn: (payload: UpdateProfileRequest) => updateProfile(payload),
    onSuccess: () => {
      // Invalidate and refetch user-related queries
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};
