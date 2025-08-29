import { fetchJson } from '@/lib/fetch';
import type { Expenditure } from '@/types/expenditure';
import { useQuery } from '@tanstack/react-query';

export const useFetchExpenditures = () => {
  return useQuery({
    queryKey: ['expenditures'],
    queryFn: async () => {
      const response = await fetchJson<Expenditure[]>('/api/expenditures');
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
