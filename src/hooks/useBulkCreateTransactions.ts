import { authenticatedFetchJson } from '@/lib/fetch';
import type { BulkCreateTransactionsParams, BulkCreateTransactionsResponse } from '@/types/transaction';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const bulkCreateTransactions = async ({
  transactions,
  actor,
}: BulkCreateTransactionsParams): Promise<BulkCreateTransactionsResponse> => {
  const response = await authenticatedFetchJson('/api/transactions/bulk-upload', {
    method: 'POST',
    body: JSON.stringify({
      transactions,
      actor,
    }),
  });

  if (response.error || !response.data) {
    console.log('response', response);
    throw new Error(response.error || 'Failed to bulk create transactions');
  }

  console.log('response', response);

  return response.data;
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
