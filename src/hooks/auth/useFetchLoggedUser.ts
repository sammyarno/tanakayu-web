import { getSupabaseClient } from '@/plugins/supabase/client';
import { useQuery } from '@tanstack/react-query';

export const fetchLoggedUser = async () => {
  const client = getSupabaseClient();

  const { data, error } = await client.auth.getUser();

  if (error) throw new Error(error.message);

  return data.user;
};

export const useFetchLoggedUser = () => {
  return useQuery({
    queryKey: ['logged-user'],
    queryFn: () => fetchLoggedUser(),
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: false,
  });
};
