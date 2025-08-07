import { useMutation, useQueryClient } from '@tanstack/react-query';

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

const bulkCreateTransactions = async ({
  transactions,
  actor,
}: BulkCreateTransactionsParams): Promise<BulkCreateTransactionsResponse> => {
  const response = await fetch('/api/transactions/bulk', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      transactions,
      actor,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create transactions');
  }

  return response.json();
};

export const useBulkCreateTransactions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkCreateTransactions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transaction-date-range'] });
    },
  });
};
