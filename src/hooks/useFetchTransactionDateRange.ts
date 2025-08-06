import { useQuery } from '@tanstack/react-query';
import dayjs from '@/utils/date';

interface DateRangeResponse {
  minDate: string | null;
  maxDate: string | null;
  hasTransactions: boolean;
}

interface MonthOption {
  value: string; // Format: MMYYYY (e.g., "072025")
  label: string; // Format: "Month YYYY" (e.g., "July 2025")
}

const fetchTransactionDateRange = async (): Promise<DateRangeResponse> => {
  const response = await fetch('/api/transactions/date-range');
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch transaction date range');
  }
  
  return response.json();
};

const generateMonthOptions = (minDate: string | null, maxDate: string | null): MonthOption[] => {
  if (!minDate || !maxDate) {
    return [];
  }
  
  const startMonth = dayjs(minDate).startOf('month');
  const endMonth = dayjs(maxDate).startOf('month');
  
  const options: MonthOption[] = [];
  let currentMonth = startMonth;
  
  while (currentMonth.isSame(endMonth, 'month') || currentMonth.isBefore(endMonth, 'month')) {
    const value = currentMonth.format('MMYYYY'); // e.g., "072025"
    const label = currentMonth.format('MMMM YYYY'); // e.g., "July 2025"
    
    options.push({ value, label });
    currentMonth = currentMonth.add(1, 'month');
  }
  
  // Sort in descending order (newest first)
  return options.reverse();
};

export const useFetchTransactionDateRange = () => {
  const query = useQuery({
    queryKey: ['transaction-date-range'],
    queryFn: fetchTransactionDateRange,
    staleTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
  });
  
  const monthOptions = generateMonthOptions(
    query.data?.minDate || null,
    query.data?.maxDate || null
  );
  
  return {
    ...query,
    monthOptions,
    hasTransactions: query.data?.hasTransactions || false,
  };
};