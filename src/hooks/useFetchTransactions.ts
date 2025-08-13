import { fetchJson } from '@/lib/fetch';
import type { TransactionsResult } from '@/types/transaction';
import { useQuery } from '@tanstack/react-query';

interface FetchTransactionsParams {
  monthFilter?: string; // Format: MMYYYY (e.g., "012025" for Jan 2025)
}

export const fetchTransactions = async ({ monthFilter }: FetchTransactionsParams = {}): Promise<TransactionsResult> => {
  const url = monthFilter ? `/api/transactions?month=${monthFilter}` : '/api/transactions';
  const response = await fetchJson(url);

  if (response.error || !response.data) {
    throw new Error(response.error || 'Failed to fetch transactions');
  }

  return response.data;
};

export const useFetchTransactions = (monthFilter?: string) => {
  return useQuery({
    queryKey: ['transactions', { monthFilter }],
    queryFn: () => fetchTransactions({ monthFilter }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
