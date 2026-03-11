import { cookies } from 'next/headers';

import { createServerClient } from '@/plugins/supabase/server';
import type { FetchResponse } from '@/types/fetch';

export async function GET() {
  const response: FetchResponse<{ minDate: string | null; maxDate: string | null; hasTransactions: boolean }> = {};

  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    // Single query using Postgres aggregate via RPC-style raw select
    const { data, error } = await supabase.rpc('get_transaction_date_range');

    if (error) {
      // Fallback: use the original two-query approach if RPC doesn't exist
      const [minResult, maxResult] = await Promise.all([
        supabase.from('transactions').select('date').order('date', { ascending: true }).limit(1).single(),
        supabase.from('transactions').select('date').order('date', { ascending: false }).limit(1).single(),
      ]);

      if (minResult.error?.code === 'PGRST116' || maxResult.error?.code === 'PGRST116') {
        response.data = { minDate: null, maxDate: null, hasTransactions: false };
        return Response.json(response);
      }

      if (minResult.error || maxResult.error) {
        console.error('Error fetching date range:', minResult.error || maxResult.error);
        response.error = 'Failed to fetch date range';
        return Response.json(response, { status: 500 });
      }

      response.data = {
        minDate: minResult.data?.date ?? null,
        maxDate: maxResult.data?.date ?? null,
        hasTransactions: !!(minResult.data && maxResult.data),
      };
      return Response.json(response);
    }

    const result = data?.[0] || data;

    response.data = {
      minDate: result?.min_date ?? null,
      maxDate: result?.max_date ?? null,
      hasTransactions: !!(result?.min_date && result?.max_date),
    };
    return Response.json(response);
  } catch (error) {
    console.error('Error fetching transaction date range:', error);
    response.error = 'Internal server error';
    return Response.json(response, { status: 500 });
  }
}
