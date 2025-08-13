import { authenticatedFetchJson } from '@/lib/fetch';
import { SimpleResponse } from '@/types/fetch';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface CreateTransactionRequest {
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description?: string;
  date: string;
  actor: string;
}

const createTransaction = async (payload: CreateTransactionRequest): Promise<SimpleResponse> => {
  const response = await authenticatedFetchJson('/api/transactions', {
    method: 'POST',
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

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data;
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTransactionRequest) => createTransaction(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};
