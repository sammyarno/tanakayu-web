import { getSupabaseClient } from '@/plugins/supabase/client';
import { getNowDate } from '@/utils/date';
import { useMutation } from '@tanstack/react-query';

export interface EditNewsEventRequest {
  id: string;
  title?: string;
  content?: string;
  type?: string;
  startDate?: string | null;
  endDate?: string | null;
  actor: string;
}

const editNewsEvent = async (payload: EditNewsEventRequest) => {
  const client = getSupabaseClient();

  const updateData: any = {
    modified_by: payload.actor,
    modified_at: getNowDate(),
  };

  // Only include fields that are provided
  if (payload.title !== undefined) updateData.title = payload.title;
  if (payload.content !== undefined) updateData.content = payload.content;
  if (payload.type !== undefined) updateData.type = payload.type;
  if (payload.startDate !== undefined) updateData.start_date = payload.startDate;
  if (payload.endDate !== undefined) updateData.end_date = payload.endDate;

  const { data, error } = await client.from('news_events').update(updateData).eq('id', payload.id).select('id');

  if (error) throw new Error(error.message);

  return data;
};

export const useEditNewsEvent = () => {
  return useMutation({
    mutationKey: ['edit-news-event'],
    mutationFn: editNewsEvent,
  });
};
