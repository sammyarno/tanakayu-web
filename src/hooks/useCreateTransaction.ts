import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedFetch } from './auth/useAuthenticatedFetch';

export interface CreateTransactionRequest {
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description?: string;
  date: string;
  actor: string;
}

const createTransaction = async (payload: CreateTransactionRequest, authenticatedFetch: any) => {
  const { data, error } = await authenticatedFetch('/api/transactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: payload.title,
      amount: payload.amount,
      type: payload.type,
      category: payload.category,
      description: payload.description,
      date: payload.date,
      actor: payload.actor,
    }),
  });

  if (error) {
    throw new Error(error);
  }

  return data.transaction;

};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  const { authenticatedFetch } = useAuthenticatedFetch();

  return useMutation({
    mutationFn: (payload: CreateTransactionRequest) => createTransaction(payload, authenticatedFetch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};
