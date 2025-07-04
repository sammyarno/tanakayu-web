import { getSupabaseClient } from '@/plugins/supabase/client';
import type { Category } from '@/types';
import { useQuery } from '@tanstack/react-query';

export const fetchAnnouncementCategories = async () => {
  const client = getSupabaseClient();

  const { data, error } = await client.from('announcement_categories').select(
    `
        id,
        label,
        code
      `
  );

  if (error) throw new Error(error.message);

  // transform data
  const result: Category[] = data.map(
    (item): Category => ({
      id: item.id,
      label: item.label,
      code: item.code,
    })
  );

  return result;
};

export const useAnnouncementCategories = () => {
  return useQuery({
    queryKey: ['announcement-categories'],
    queryFn: () => fetchAnnouncementCategories(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
