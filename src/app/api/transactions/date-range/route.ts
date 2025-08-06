import { cookies } from 'next/headers';

import { createServerClient } from '@/plugins/supabase/server';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    // Get the earliest and latest transaction dates
    const [minResult, maxResult] = await Promise.all([
      supabase.from('transactions').select('date').order('date', { ascending: true }).limit(1).single(),
      supabase.from('transactions').select('date').order('date', { ascending: false }).limit(1).single(),
    ]);

    if (minResult.error?.code === 'PGRST116' || maxResult.error?.code === 'PGRST116') {
      return Response.json({
        minDate: null,
        maxDate: null,
        hasTransactions: false,
      });
    }

    // Handle other errors
    if (minResult.error || maxResult.error) {
      console.error('Error fetching date range:', minResult.error || maxResult.error);
      return Response.json({ error: 'Failed to fetch date range' }, { status: 500 });
    }

    if (!minResult.data || !maxResult.data) {
      return Response.json({
        minDate: null,
        maxDate: null,
        hasTransactions: false,
      });
    }

    const minDate = minResult.data.date;
    const maxDate = maxResult.data.date;

    return Response.json({
      minDate,
      maxDate,
      hasTransactions: true,
    });
  } catch (error) {
    console.error('Error fetching transaction date range:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
