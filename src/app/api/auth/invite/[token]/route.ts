import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

import { createServerClient } from '@/plugins/supabase/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore, true);
    const nowIso = new Date().toISOString();

    const { data } = await supabase
      .from('member_invites')
      .select('full_name, phone_number')
      .eq('token', token)
      .is('used_at', null)
      .is('revoked_at', null)
      .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
      .maybeSingle();

    if (!data) {
      return Response.json({ valid: false }, { status: 200 });
    }

    return Response.json(
      { valid: true, fullName: data.full_name, phoneNumber: data.phone_number },
      { status: 200 }
    );
  } catch {
    return Response.json({ valid: false }, { status: 200 });
  }
}
