import { useState } from 'react';

import { useUserAuthStore } from '@/store/userAuthStore';

import { useAuth } from './useAuth';

export interface LoginRequest {
  email: string;
  password: string;
}

// This hook maintains backward compatibility with the previous React Query implementation
// while using the new Zustand store under the hood
export const useSignIn = () => {
  const { signIn, clearError, error, isLoading } = useAuth();
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  const mutateAsync = async (payload: LoginRequest) => {
    setIsSuccess(false);
    setIsError(false);
    clearError();

    try {
      const user = await signIn(payload.email, payload.password);
      setIsSuccess(!!user);
      setIsError(!user);
      return { user };
    } catch (e) {
      setIsError(true);
      throw e;
    }
  };

  return {
    mutateAsync,
    isPending: isLoading,
    isLoading,
    error: error ? new Error(error) : null,
    isSuccess,
    isError,
  };
};

// Keep the original function for direct API calls if needed
export const postSignIn = async (payload: LoginRequest) => {
  const { signIn } = useUserAuthStore.getState();
  return { user: await signIn(payload.email, payload.password) };
};
