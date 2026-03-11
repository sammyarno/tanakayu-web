import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

import { logAudit } from '@/lib/audit';
import { registerSchema } from '@/lib/validations/auth';
import { createServerClient } from '@/plugins/supabase/server';

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

    // Check if username already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single();

    if (existingProfile) {
      return Response.json({ error: 'Username already taken' }, { status: 409 });
    }

    // Create auth user via Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username, full_name },
    });

    if (authError || !authData.user) {
      return Response.json({ error: authError?.message || 'Failed to create user' }, { status: 500 });
    }

    // Update profile with additional fields (trigger should have created the row)
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        username,
        full_name,
        phone_number,
        address: `${cluster}, ${address}`,
        role: 'MEMBER' as const,
      })
      .eq('id', authData.user.id);

    if (profileError) {
      console.error('Error updating profile:', profileError);
      // Clean up: delete the auth user if profile update fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      return Response.json({ error: 'Failed to create profile' }, { status: 500 });
    }

    await logAudit(supabase, {
      action: 'register',
      entityType: 'user',
      entityId: authData.user.id,
      actor: username,
    });

    return Response.json({ id: authData.user.id }, { status: 200 });
  } catch (error) {
    console.error('Error registering user:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
