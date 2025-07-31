import { getSupabaseClient } from '@/plugins/supabase/client';
import type { Transaction, TransactionsByDate, TransactionsResult } from '@/types';
import { useQuery } from '@tanstack/react-query';

interface FetchTransactionsParams {
  monthFilter?: string; // Format: MMYYYY (e.g., "012025" for Jan 2025)
}

export const fetchTransactions = async ({ monthFilter }: FetchTransactionsParams = {}) => {
  const client = getSupabaseClient();

  let query = client
    .from('transactions')
    .select('id, title, amount, type, category, description, date, created_at, created_by')
    .order('date', { ascending: false });

  // Apply month filter if provided
  if (monthFilter && monthFilter.length === 6) {
    const month = parseInt(monthFilter.substring(0, 2), 10);
    const year = parseInt(monthFilter.substring(2), 10);

    // Calculate start and end dates for the month
    const startDate = new Date(year, month - 1, 1); // month is 0-indexed
    const endDate = new Date(year, month, 0, 23, 59, 59, 999); // Last day of month at 23:59:59

    const startDateStr = startDate.toISOString().split('T')[0]; // YYYY-MM-DD
    const endDateStr = endDate.toISOString().split('T')[0]; // YYYY-MM-DD

    query = query.gte('date', startDateStr).lte('date', endDateStr);
  }

  const { data: transactions, error } = await query;

  if (error) throw new Error(error.message);
  if (!transactions) return { balance: 0, transactions: [] };

  // Transform data to camelCase
  const transformedTransactions: Transaction[] = transactions.map(t => ({
    id: t.id,
    title: t.title,
    amount: t.amount,
    type: t.type,
    category: t.category,
    description: t.description,
    date: t.date,
    createdAt: t.created_at,
    createdBy: t.created_by,
  }));

  // Calculate balance (income - expense)
  const balance = transformedTransactions.reduce((acc, transaction) => {
    if (transaction.type === 'income') {
      return acc + transaction.amount;
    } else if (transaction.type === 'expense') {
      return acc - transaction.amount;
    }
    return acc;
  }, 0);

  // Group transactions by date in descending order
  const groupedByDate = transformedTransactions.reduce((acc, transaction) => {
    const date = transaction.date;
    const existingGroup = acc.find(group => group.date === date);

    if (existingGroup) {
      existingGroup.transactions.push(transaction);
    } else {
      acc.push({
        date,
        transactions: [transaction],
      });
    }

    return acc;
  }, [] as TransactionsByDate[]);

  // Sort groups by date descending and transactions within each group by creation time descending
  groupedByDate.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  groupedByDate.forEach(group => {
    group.transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  });

  return {
    balance,
    transactions: groupedByDate,
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
