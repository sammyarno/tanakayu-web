import { cookies } from 'next/headers';

import { createServerClient } from '@/plugins/supabase/server';
import type { FetchResponse } from '@/types/fetch';

export async function GET() {
  const response: FetchResponse<{ minDate: string | null; maxDate: string | null; hasTransactions: boolean }> = {};

  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    // Get the earliest and latest transaction dates
    const [minResult, maxResult] = await Promise.all([
      supabase.from('transactions').select('date').order('date', { ascending: true }).limit(1).single(),
      supabase.from('transactions').select('date').order('date', { ascending: false }).limit(1).single(),
    ]);

    if (minResult.error?.code === 'PGRST116' || maxResult.error?.code === 'PGRST116') {
      response.data = {
        minDate: null,
        maxDate: null,
        hasTransactions: false,
      };
      return Response.json(response);
    }

    // Handle other errors
    if (minResult.error || maxResult.error) {
      console.error('Error fetching date range:', minResult.error || maxResult.error);
      response.error = 'Failed to fetch date range';
      return Response.json(response, { status: 500 });
    }

    if (!minResult.data || !maxResult.data) {
      response.data = {
        minDate: null,
        maxDate: null,
        hasTransactions: false,
      };
      return Response.json(response);
    }

    const minDate = minResult.data.date;
    const maxDate = maxResult.data.date;

    response.data = {
      minDate,
      maxDate,
      hasTransactions: true,
    };
    return Response.json(response);
  } catch (error) {
    console.error('Error fetching transaction date range:', error);
    response.error = 'Internal server error';
    return Response.json(response, { status: 500 });
  }
}
