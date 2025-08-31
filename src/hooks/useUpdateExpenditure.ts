import { authenticatedFetchJson } from '@/lib/fetch';
import type { Expenditure, UpdateExpenditureRequest } from '@/types/expenditure';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useUpdateExpenditure = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateExpenditureRequest) => {
      const response = await authenticatedFetchJson<Expenditure>(`/api/expenditures/${data.id}`, {
        method: 'PATCH',
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
