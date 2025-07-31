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

const createTransaction = async (payload: CreateTransactionRequest) => {
  const response = await fetch('/api/transactions', {
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

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create transaction');
  }

  const { transaction } = await response.json();
  return transaction;
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['create-transaction'],
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};
