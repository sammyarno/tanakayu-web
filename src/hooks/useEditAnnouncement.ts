import { getSupabaseClient } from '@/plugins/supabase/client';
import { getNowDate } from '@/utils/date';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface EditAnnouncementRequest {
  id: string;
  title: string;
  content: string;
  categories: string[];
  actor: string;
}

const editAnnouncement = async (payload: EditAnnouncementRequest) => {
  const client = getSupabaseClient();

  // update
  const { data, error } = await client
    .from('announcements')
    .update({
      title: payload.title,
      content: payload.content,
      modified_at: getNowDate(),
      modified_by: payload.actor,
    })
    .eq('id', payload.id)
    .select('id');

  // delete all
  const { error: categoryError } = await client
    .from('announcement_category_map')
    .delete()
    .eq('announcement_id', payload.id);

  if (categoryError) throw new Error(categoryError.message);

  // insert
  const { error: categoryInsertError } = await client.from('announcement_category_map').insert([
    ...payload.categories.map(category_id => ({
      announcement_id: payload.id,
      category_id,
      created_by: payload.actor,
      created_at: getNowDate(),
    })),
  ]);

  if (categoryInsertError) throw new Error(categoryInsertError.message);

  if (error) throw new Error(error.message);

  return data;
};

export const useEditAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['edit-announcement'],
    mutationFn: editAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
};
