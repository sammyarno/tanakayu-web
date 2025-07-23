import { getSupabaseClient } from '@/plugins/supabase/client';
import { getNowDate } from '@/utils/date';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface CreateAnnouncementRequest {
  title: string;
  content: string;
  categories: string[];
  actor: string;
}

const createAnnouncement = async (payload: CreateAnnouncementRequest) => {
  const client = getSupabaseClient();

  // Insert the announcement
  const { data, error } = await client
    .from('announcements')
    .insert({
      title: payload.title,
      content: payload.content,
      created_at: getNowDate(),
      created_by: payload.actor,
    })
    .select('id');

  if (error) throw new Error(error.message);
  
  if (!data || data.length === 0) {
    throw new Error('Failed to create announcement');
  }
  
  const announcementId = data[0].id;

  // Insert category mappings
  const { error: categoryInsertError } = await client.from('announcement_category_map').insert(
    payload.categories.map(category_id => ({
      announcement_id: announcementId,
      category_id,
      created_by: payload.actor,
      created_at: getNowDate(),
    }))
  );

  if (categoryInsertError) throw new Error(categoryInsertError.message);

  return data[0];
};

export const useCreateAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['create-announcement'],
    mutationFn: createAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
};
