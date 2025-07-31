import { getSupabaseClient } from '@/plugins/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface CreateTransactionRequest {
  title: string;
  description?: string | null;
  amount: number;
  category: string;
  type: string;
  actor: string;
  date: string;
}

const createTransaction = async (payload: CreateTransactionRequest) => {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from('transactions')
    .insert({
      title: payload.title,
      description: payload.description || null,
      amount: payload.amount,
      category: payload.category,
      type: payload.type,
      date: payload.date,
      created_by: payload.actor,
    })
    .select('id');

  if (error) throw new Error(error.message);

  return data?.[0]?.id;
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['create-transaction'],
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};