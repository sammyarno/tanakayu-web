import { createServerClient } from '@/plugins/supabase/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    // Get the earliest and latest transaction dates
    const { data: dateRange, error } = await supabase
      .from('transactions')
      .select('date.min(), date.max()');

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    if (!dateRange || dateRange.length === 0) {
      return Response.json({ 
        minDate: null, 
        maxDate: null,
        hasTransactions: false 
      });
    }

    const { min: minDate, max: maxDate } = dateRange[0];

    return Response.json({ 
      minDate, 
      maxDate,
      hasTransactions: true 
    });
  } catch (error) {
    console.error('Error fetching transaction date range:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}