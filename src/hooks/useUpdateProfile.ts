import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuth } from './auth/useAuth';
import { useAuthenticatedFetch } from './auth/useAuthenticatedFetch';

export interface UpdateProfileRequest {
  displayName?: string;
  email?: string;
  password?: string;
}

const updateProfile = async (payload: UpdateProfileRequest, authenticatedFetch: any) => {
  const { data, error } = await authenticatedFetch('/api/profile', {
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
  const { updateUser } = useAuth();
  const { authenticatedFetch } = useAuthenticatedFetch();

  return useMutation({
    mutationFn: (payload: UpdateProfileRequest) => updateProfile(payload, authenticatedFetch),
    onSuccess: (updatedUser) => {
      // Update the user in the auth store
      updateUser(updatedUser);

      // Invalidate and refetch user-related queries
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};
