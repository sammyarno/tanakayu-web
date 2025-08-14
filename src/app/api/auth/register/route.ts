import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

import { hashWithSalt } from '@/lib/bcrypt';
import { registerSchema } from '@/lib/validations/auth';
import { createServerClient } from '@/plugins/supabase/server';
import { getNowDate } from '@/utils/date';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore, true);
    const body = await request.json();

    // Validate input
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return Response.json({ error: 'Invalid input', details: validationResult.error.issues }, { status: 400 });
    }

    const { username, full_name, email, password, phone_number, address, cluster } = validationResult.data;

    const hashedPassword = await hashWithSalt(password);

    const { data, error } = await supabase
      .from('users')
      .insert({
        username,
        email,
        phone_number,
        address: `${cluster}, ${address}`,
        created_at: getNowDate(),
        created_by: `register:${username}`,
        full_name,
        hashed_password: hashedPassword,
      })
      .select('id')
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ id: data.id }, { status: 200 });
  } catch (error) {
    console.error('Error registering user:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
