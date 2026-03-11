import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

import { createServerClient } from '@/plugins/supabase/server';
import { normalizePhone } from '@/utils/phone';

const PHONE_REGEX = /^(\+62|62|0)8[1-9][0-9]{6,10}$/;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    if (!phone || !PHONE_REGEX.test(phone.trim())) {
      return Response.json({ permitted: false }, { status: 200 });
    }

    const normalized = normalizePhone(phone);
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    const { data } = await supabase
      .from('permitted_phones')
      .select('id')
      .eq('phone_number', normalized)
      .single();

    return Response.json({ permitted: !!data }, { status: 200 });
  } catch {
    return Response.json({ permitted: false }, { status: 200 });
  }
}
