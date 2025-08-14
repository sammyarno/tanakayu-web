import { fetchJson } from '@/lib/fetch';
import type { DateRangeResponse } from '@/types/date';
import { generateMonthOptions } from '@/utils/date';
import { useQuery } from '@tanstack/react-query';

const fetchTransactionDateRange = async (): Promise<DateRangeResponse> => {
  const response = await fetchJson<DateRangeResponse>('/api/transactions/date-range');

  if (response.error || !response.data) {
    throw new Error(response.error || 'Failed to fetch transaction date range');
  }

  return response.data;
};

export const useFetchTransactionDateRange = () => {
  const query = useQuery({
    queryKey: ['transaction-date-range'],
    queryFn: fetchTransactionDateRange,
    staleTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
  });

  const monthOptions = generateMonthOptions(query.data?.minDate || null, query.data?.maxDate || null);

  return {
    ...query,
    monthOptions,
    hasTransactions: query.data?.hasTransactions || false,
  };
};
