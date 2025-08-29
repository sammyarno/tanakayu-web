import { useMutation, useQueryClient } from '@tanstack/react-query';

import { authenticatedFetchJson } from '@/lib/fetch';
import type { Expenditure, CreateExpenditureRequest } from '@/types/expenditure';

export const useCreateExpenditure = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateExpenditureRequest) => {
      const response = await authenticatedFetchJson<Expenditure>('/api/expenditures', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (response.error) {
        throw new Error(response.error);
      }

      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch expenditures
      queryClient.invalidateQueries({ queryKey: ['expenditures'] });
    },
  });
};