import { authenticatedFetchJson } from '@/lib/fetch';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface Invite {
  id: string;
  token: string;
  fullName: string;
  phoneNumber: string | null;
  createdBy: string;
  expiresAt: string | null;
  usedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
}

const QUERY_KEY = ['invites'];

const fetchInvites = async (): Promise<Invite[]> => {
  const response = await authenticatedFetchJson<Invite[]>('/api/admin/invites');
  if (response.error) throw new Error(response.error);
  return response.data ?? [];
};

export const useFetchInvites = () => {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchInvites,
    staleTime: 1000 * 60 * 2,
  });
};

export const useCreateInvite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { full_name: string; phone_number?: string; expires_at?: string }) => {
      const response = await authenticatedFetchJson<Invite>('/api/admin/invites', {
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

export const useRevokeInvite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await authenticatedFetchJson(`/api/admin/invites?id=${id}`, { method: 'DELETE' });
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
};
