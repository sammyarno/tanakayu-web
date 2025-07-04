import { getSupabaseClient } from '@/plugins/supabase/client';
import type { Announcement, Category } from '@/types';
import { useQuery } from '@tanstack/react-query';

export const fetchAnnouncements = async () => {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from('announcements')
    .select(
      `
        id,
        title,
        content,
        created_at,
        created_by,
        announcement_category_map (
          announcement_categories (
            id,
            label,
            code
          )
        )
      `
    )
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  // transform data
  const result: Announcement[] = data.map(
    (item): Announcement => ({
      id: item.id,
      title: item.title,
      content: item.content,
      createdAt: item.created_at,
      createdBy: item.created_by,
      categories: item.announcement_category_map.map(
        (c): Category => ({
          id: c.announcement_categories.id,
          label: c.announcement_categories.label,
          code: c.announcement_categories.code,
        })
      ),
    })
  );

  return result;
};

export const useAnnouncements = () => {
  return useQuery({
    queryKey: ['announcements'],
    queryFn: () => fetchAnnouncements(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
