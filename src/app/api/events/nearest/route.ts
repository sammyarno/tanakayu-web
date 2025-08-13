import { cookies } from 'next/headers';

import { createServerClient } from '@/plugins/supabase/server';
import { NewsEvent } from '@/types';
import type { FetchResponse } from '@/types/fetch';

export async function GET() {
  const response: FetchResponse<NewsEvent[]> = {};

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
      response.error = error.message;
      return Response.json(response, { status: 500 });
    }

    // Transform data
    const result = data.map(event => ({
      ...event,
      startDate: event.start_date,
      endDate: event.end_date,
    }));

    response.data = result;
    return Response.json(response);
  } catch (error) {
    console.error('Error fetching nearest events:', error);
    response.error = 'Internal server error';
    return Response.json(response, { status: 500 });
  }
}
