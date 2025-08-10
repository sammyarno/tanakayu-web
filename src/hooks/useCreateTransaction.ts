import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authenticatedFetchJson } from '@/utils/authenticatedFetch';

export interface CreateTransactionRequest {
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description?: string;
  date: string;
  actor: string;
}

const createTransaction = async (payload: CreateTransactionRequest) => {
  const data = await authenticatedFetchJson('/api/transactions', {
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

  return data.transaction;

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
