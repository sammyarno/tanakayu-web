import { authenticatedFetchJson } from '@/lib/fetch';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface PermittedPhone {
  id: string;
  phoneNumber: string;
  fullName: string;
  registeredBy: string;
  createdAt: string;
}

const QUERY_KEY = ['permitted-phones'];

const fetchPermittedPhones = async (search?: string): Promise<PermittedPhone[]> => {
  const url = search
    ? `/api/permitted-phones?search=${encodeURIComponent(search)}`
    : '/api/permitted-phones';
  const response = await authenticatedFetchJson<PermittedPhone[]>(url);
  if (response.error) throw new Error(response.error);
  return response.data ?? [];
};

export const useFetchPermittedPhones = (search?: string) => {
  return useQuery({
    queryKey: [...QUERY_KEY, { search }],
    queryFn: () => fetchPermittedPhones(search),
    staleTime: 1000 * 60 * 5,
  });
};

export const useAddPermittedPhones = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { phones: { phone_number: string; full_name: string }[] }) => {
      const response = await authenticatedFetchJson('/api/permitted-phones', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
};

export const useDeletePermittedPhone = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await authenticatedFetchJson(`/api/permitted-phones?id=${id}`, {
        method: 'DELETE',
      });
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
};
