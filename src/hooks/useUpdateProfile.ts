import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuth } from './auth/useAuth';

export interface UpdateProfileRequest {
  displayName?: string;
  email?: string;
  password?: string;
}

const updateProfile = async (payload: UpdateProfileRequest) => {
  const response = await fetch('/api/profile', {
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

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update profile');
  }

  const { user } = await response.json();
  return user;
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { updateUser } = useAuth();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: data => {
      // Update the user store with the new data
      if (data) {
        updateUser(data);
      }

      // Invalidate and refetch any user-related queries
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: error => {
      console.error('Profile update failed:', error);
    },
  });
};
