import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { hashWithSalt } from '@/lib/bcrypt';
import { createServerClient } from '@/plugins/supabase/server';
import { verifyAuth } from '@/lib/auth';
import { User } from '@/types/auth';
import { FetchResponse } from '@/types/fetch';
import { getNowDate } from '@/utils/date';

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

    const updateData: any = {};

    if (body.display_name) updateData.full_name = body.display_name;
    if (body.phone) updateData.phone_number = body.phone;
    if (body.address) updateData.address = body.address;
    if (body.email) updateData.email = body.email;
    if (body.password) {
      updateData.hashed_password = await hashWithSalt(body.password);
      delete updateData.password;
    }

    if (Object.keys(updateData).length === 0) {
      response.error = 'No valid fields provided for update';
      return NextResponse.json(response, { status: 400 });
    }

    const { data, error } = await supabase
      .from('users')
      .update({
        ...updateData,
        modified_at: getNowDate(),
        modified_by: user!.username,
      })
      .eq('id', id)
      .select('id, username, email, full_name, address, phone_number, role')
      .single();

    if (error) {
      console.error('Error updating user:', error);
      response.error = 'Failed to update user';
      return NextResponse.json(response, { status: 500 });
    }

    response.data = {
      id: data.id,
      username: data.username,
      email: data.email,
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
