import { useMutation, useQueryClient } from '@tanstack/react-query';

import { authenticatedFetchJson } from '@/utils/authenticatedFetch';

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
  { transactions, actor }: BulkCreateTransactionsParams
): Promise<BulkCreateTransactionsResponse> => {
  return authenticatedFetchJson('/api/transactions/bulk', {
    method: 'POST',
    body: JSON.stringify({
      transactions,
      actor,
    }),
  });
};

export const useBulkCreateTransactions = () => {
  const queryClient = useQueryClient();


  return useMutation({
    mutationFn: (params: BulkCreateTransactionsParams) => bulkCreateTransactions(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transaction-date-range'] });
    },
  });
};
