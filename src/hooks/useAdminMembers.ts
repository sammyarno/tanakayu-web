import { authenticatedFetchJson } from '@/lib/fetch';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface Member {
  id: string;
  username: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  role: string;
  createdAt: string;
  email: string;
}

const QUERY_KEY = ['admin-members'];

const fetchMembers = async (search?: string): Promise<Member[]> => {
  const url = search
    ? `/api/admin/members?search=${encodeURIComponent(search)}`
    : '/api/admin/members';
  const response = await authenticatedFetchJson<Member[]>(url);
  if (response.error) throw new Error(response.error);
  return response.data ?? [];
};

export const useFetchMembers = (search?: string) => {
  return useQuery({
    queryKey: [...QUERY_KEY, { search }],
    queryFn: () => fetchMembers(search),
    staleTime: 1000 * 60 * 2,
  });
};

export const useAdminDeleteMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await authenticatedFetchJson(`/api/admin/members/${id}`, {
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

export const useAdminUpdateMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      id: string;
      full_name?: string;
      email?: string;
      phone_number?: string;
      address?: string;
      password?: string;
    }) => {
      const { id, ...body } = payload;
      const response = await authenticatedFetchJson(`/api/admin/members/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
};
