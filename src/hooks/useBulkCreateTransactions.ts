import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuthenticatedFetch } from './auth/useAuthenticatedFetch';

interface Transaction {
  amount: number;
  category: string;
  date: string;
  description: string;
  title: string;
  type: 'income' | 'expense';
}

interface BulkCreateTransactionsParams {
  transactions: Transaction[];
  actor: string;
}

interface BulkCreateTransactionsResponse {
  success: boolean;
  count: number;
  transactions: any[];
}

const bulkCreateTransactions = async (
  { transactions, actor }: BulkCreateTransactionsParams,
  authenticatedFetch: any
): Promise<BulkCreateTransactionsResponse> => {
  const { data, error } = await authenticatedFetch('/api/transactions/bulk', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      transactions,
      actor,
    }),
  });

  if (error) {
    throw new Error(error);
  }

  return data;
};

export const useBulkCreateTransactions = () => {
  const queryClient = useQueryClient();
  const { authenticatedFetch } = useAuthenticatedFetch();

  return useMutation({
    mutationFn: (params: BulkCreateTransactionsParams) => bulkCreateTransactions(params, authenticatedFetch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transaction-date-range'] });
    },
  });
};
