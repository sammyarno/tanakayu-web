import { useMutation } from '@tanstack/react-query';

export interface RegisterRequest {
  username: string;
  full_name: string;
  cluster: string;
  address: string;
  password: string;
  email: string;
  phone_number: string;
}

const registerMember = async (payload: RegisterRequest) => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to register');
  }

  return response.json();
};

export const useRegister = () => {
  return useMutation({
    mutationKey: ['register'],
    mutationFn: registerMember,
  });
};
