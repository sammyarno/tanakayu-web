import { createServerClient } from '@/plugins/supabase/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('news_events')
      .select('id,title,type,content,start_date,end_date')
      .eq('type', 'event')
      .gte('start_date', today)
      .limit(2)
      .order('start_date', {
        ascending: true,
      });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    // Transform data
    const result = data.map((event) => ({
      ...event,
      startDate: event.start_date,
      endDate: event.end_date,
    }));

    return Response.json({ events: result });
  } catch (error) {
    console.error('Error fetching nearest events:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}