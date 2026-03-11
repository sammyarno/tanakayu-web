import { NextRequest, NextResponse } from 'next/server';

import { VERIFY_MEMBER_ROLES } from '@/constants/roles';
import { verifyAuth } from '@/lib/auth';
import { cookies } from 'next/headers';
import { createServerClient } from '@/plugins/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { user, error: authError } = await verifyAuth(req);
    if (authError) return authError;
    if (!user || !VERIFY_MEMBER_ROLES.includes(user.role as any)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { user_id } = await req.json();

    if (!user_id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore, true);

    const { data: profile, error: queryError } = await supabase
      .from('profiles')
      .select('full_name, phone_number, address, role, created_at')
      .eq('id', user_id)
      .single();

    if (queryError || !profile) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        full_name: profile.full_name,
        phone_number: profile.phone_number,
        address: profile.address,
        role: profile.role,
        member_since: profile.created_at,
      },
    });
  } catch (error) {
    console.error('Error verifying member:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
