import { getSupabaseClient } from '@/plugins/supabase/client';
import { useMutation } from '@tanstack/react-query';

export interface LoginRequest {
  email: string;
  password: string;
}

const postSignIn = async (payload: LoginRequest) => {
  const client = getSupabaseClient();

  const { data, error } = await client.auth.signInWithPassword({
    email: payload.email,
    password: payload.password,
  });

  if (error) throw new Error(error.message);

  return data;
};

export const useSignIn = () => {
  return useMutation({
    mutationKey: ['sign-in'],
    mutationFn: postSignIn,
  });
};
