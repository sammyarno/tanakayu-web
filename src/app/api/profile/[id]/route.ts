import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { verifyAuth } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { createServerClient } from '@/plugins/supabase/server';
import { User } from '@/types/auth';
import { FetchResponse } from '@/types/fetch';
import { normalizePhone } from '@/utils/phone';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const response: FetchResponse<User> = {};

  try {
    const { user, error: authError } = await verifyAuth(request);
    if (authError) return authError;

    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore, true);
    const body = await request.json();
    const { id } = await params;

    if (!id) {
      response.error = 'User ID is required';
      return NextResponse.json(response, { status: 400 });
    }

    // Update profile fields
    const profileUpdate: Record<string, string> = {};
    if (body.full_name || body.display_name) profileUpdate.full_name = body.full_name || body.display_name;
    if (body.phone) profileUpdate.phone_number = normalizePhone(body.phone);
    if (body.address) profileUpdate.address = body.address;

    // Update password via Supabase Auth if provided
    if (body.password) {
      const { error: passwordError } = await supabase.auth.admin.updateUserById(id, {
        password: body.password,
      });
      if (passwordError) {
        console.error('Error updating password:', passwordError);
        response.error = 'Failed to update password';
        return NextResponse.json(response, { status: 500 });
      }
    }

    // Update email in Supabase Auth if provided
    if (body.email) {
      const { error: emailError } = await supabase.auth.admin.updateUserById(id, {
        email: body.email,
      });
      if (emailError) {
        console.error('Error updating email:', emailError);
        response.error = 'Failed to update email';
        return NextResponse.json(response, { status: 500 });
      }
    }

    if (Object.keys(profileUpdate).length === 0 && !body.password && !body.email) {
      response.error = 'No valid fields provided for update';
      return NextResponse.json(response, { status: 400 });
    }

    if (Object.keys(profileUpdate).length > 0) {
      const { error } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', id);

      if (error) {
        console.error('Error updating profile:', error);
        response.error = 'Failed to update profile';
        return NextResponse.json(response, { status: 500 });
      }
    }

    // Fetch updated profile
    const { data, error: fetchError } = await supabase
      .from('profiles')
      .select('id, username, full_name, address, phone_number, role')
      .eq('id', id)
      .single();

    if (fetchError || !data) {
      console.error('Error fetching updated profile:', fetchError);
      response.error = 'Failed to fetch updated profile';
      return NextResponse.json(response, { status: 500 });
    }

    // Get email from auth user
    const { data: { user: authUser } } = await supabase.auth.admin.getUserById(id);

    await logAudit(supabase, {
      action: 'update',
      entityType: 'profile',
      entityId: id,
      actor: user!.username,
      metadata: { fields: Object.keys(profileUpdate) },
    });

    response.data = {
      id: data.id,
      username: data.username,
      email: authUser?.email || '',
      displayName: data.full_name,
      phone: data.phone_number,
      address: data.address,
      role: data.role,
    } as User;

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating profile:', error);
    response.error = 'Internal server error';
    return NextResponse.json(response, { status: 500 });
  }
}
