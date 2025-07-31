import { createServerClient } from '@/plugins/supabase/server';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);
    const body = await request.json();
    
    const { targetID, targetType, comment, actor } = body;

    const { data, error } = await supabase
      .from('comments')
      .insert([
        {
          comment,
          created_by: actor,
          target_id: targetID,
          target_type: targetType,
        },
      ])
      .select('id');

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ data });
  } catch (error) {
    console.error('Error posting comment:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}