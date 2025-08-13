import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { hashWithSalt } from '@/lib/bcrypt';
import { createServerClient } from '@/plugins/supabase/server';
import { User } from '@/types/auth';
import { FetchResponse } from '@/types/fetch';
import { getNowDate } from '@/utils/date';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const response: FetchResponse<User> = {};

  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore, true);
    const body = await request.json();
    const { id } = await params;

    if (!id) {
      response.error = 'User ID is required';
      return NextResponse.json(response, { status: 400 });
    }

    const updateData: any = {};
    const allowedFields = ['full_name', 'address', 'email', 'phone_number', 'password'];

    for (const field of allowedFields) {
      if (body[field]) {
        if (field === 'password') {
          updateData[field] = await hashWithSalt(body[field]);
        } else {
          updateData[field] = body[field];
        }
      }
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
        modified_by: body.username,
      })
      .eq('id', id)
      .select('id, username, email, full_name, address, phone_number')
      .single();

    if (error) {
      console.error('Error updating user:', error);
      response.error = 'Failed to update user';
      return NextResponse.json(response, { status: 500 });
    }

    response.data = data;

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating profile:', error);
    response.error = 'Internal server error';
    return NextResponse.json(response, { status: 500 });
  }
}
