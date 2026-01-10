import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { user_id } = await req.json();

    if (!user_id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Initialize Supabase Admin Client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );

    // Query user data
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('full_name, phone_number, address, role, created_at')
      .eq('id', user_id)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        full_name: user.full_name,
        phone_number: user.phone_number,
        address: user.address,
        role: user.role,
        member_since: user.created_at,
      },
    });
  } catch (error) {
    console.error('Error verifying member:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
