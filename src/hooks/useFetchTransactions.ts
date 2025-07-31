import type { Transaction, TransactionsByDate, TransactionsResult } from '@/types';
import { useQuery } from '@tanstack/react-query';

interface FetchTransactionsParams {
  monthFilter?: string; // Format: MMYYYY (e.g., "012025" for Jan 2025)
}

export const fetchTransactions = async ({ monthFilter }: FetchTransactionsParams = {}) => {
  const url = monthFilter ? `/api/transactions?month=${monthFilter}` : '/api/transactions';
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch transactions');
  }

  const data = await response.json();

  const transformedTransactions: TransactionsByDate[] = Object.entries(data.transactions).map(
    ([date, transactions]) => ({
      date,
      details: transactions as Transaction[],
    })
  );

  return {
    balance: data.balance,
    transactions: transformedTransactions,
  } as TransactionsResult;
};

export const useFetchTransactions = (monthFilter?: string) => {
  return useQuery({
    queryKey: ['transactions', { monthFilter }],
    queryFn: () => fetchTransactions({ monthFilter }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
