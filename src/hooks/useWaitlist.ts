import { authenticatedFetchJson } from '@/lib/fetch';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export type WaitlistStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface WaitlistEntry {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  status: WaitlistStatus;
  rejectReason: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

const QUERY_KEY = ['waitlist'];

const fetchWaitlist = async (status: WaitlistStatus, search?: string): Promise<WaitlistEntry[]> => {
  const params = new URLSearchParams({ status });
  if (search) params.set('search', search);
  const response = await authenticatedFetchJson<WaitlistEntry[]>(`/api/admin/waitlist?${params.toString()}`);
  if (response.error) throw new Error(response.error);
  return response.data ?? [];
};

export const useFetchWaitlist = (status: WaitlistStatus, search?: string, enabled = true) => {
  return useQuery({
    queryKey: [...QUERY_KEY, { status, search }],
    queryFn: () => fetchWaitlist(status, search),
    staleTime: 1000 * 60 * 2,
    enabled,
  });
};

export const useReviewWaitlist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { ids: string[]; action: 'approve' | 'reject'; reason?: string }) => {
      const response = await authenticatedFetchJson<{ approved: string[]; failed: { id: string; error: string }[] }>(
        '/api/admin/waitlist',
        { method: 'PATCH', body: JSON.stringify(payload) }
      );
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
};

export const useDeleteWaitlistEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await authenticatedFetchJson(`/api/admin/waitlist?id=${id}`, { method: 'DELETE' });
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
};
