import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

import { verifyAuth } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { createServerClient } from '@/plugins/supabase/server';
import type { FetchResponse } from '@/types/fetch';
import { normalizePhone } from '@/utils/phone';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const response: FetchResponse<any> = {};

  try {
    const { user, error: authError } = await verifyAuth(request);
    if (authError) return authError;

    if (user!.role !== 'SUPERADMIN') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    if (id === user!.id) {
      return Response.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore, true);

    // Delete profile row first
    const { error: profileError } = await supabase.from('profiles').delete().eq('id', id);
    if (profileError) {
      console.error('Error deleting profile:', profileError);
      response.error = 'Failed to delete profile';
      return Response.json(response, { status: 500 });
    }

    // Delete auth user
    const { error: authDeleteError } = await supabase.auth.admin.deleteUser(id);
    if (authDeleteError) {
      console.error('Error deleting auth user:', authDeleteError);
      response.error = 'Failed to delete user';
      return Response.json(response, { status: 500 });
    }

    logAudit(supabase, {
      action: 'admin_delete_member',
      entityType: 'user',
      entityId: id,
      actor: user!.username,
    });

    response.data = { success: true };
    return Response.json(response);
  } catch (error) {
    console.error('Error deleting member:', error);
    response.error = 'Internal server error';
    return Response.json(response, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const response: FetchResponse<any> = {};

  try {
    const { user, error: authError } = await verifyAuth(request);
    if (authError) return authError;

    if (user!.role !== 'SUPERADMIN') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore, true);

    // Build profile update
    const profileUpdate: Record<string, string> = {};
    if (body.full_name) profileUpdate.full_name = body.full_name;
    if (body.phone_number) profileUpdate.phone_number = normalizePhone(body.phone_number);
    if (body.address) profileUpdate.address = body.address;

    // Update password via Supabase Auth
    if (body.password) {
      const { error } = await supabase.auth.admin.updateUserById(id, {
        password: body.password,
      });
      if (error) {
        response.error = 'Failed to update password';
        return Response.json(response, { status: 500 });
      }
    }

    // Update email via Supabase Auth
    if (body.email) {
      const { error } = await supabase.auth.admin.updateUserById(id, {
        email: body.email,
      });
      if (error) {
        response.error = 'Failed to update email';
        return Response.json(response, { status: 500 });
      }
    }

    // Update profiles table
    if (Object.keys(profileUpdate).length > 0) {
      const { error } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', id);

      if (error) {
        console.error('Error updating profile:', error);
        response.error = 'Failed to update profile';
        return Response.json(response, { status: 500 });
      }
    }

    if (Object.keys(profileUpdate).length === 0 && !body.password && !body.email) {
      response.error = 'No fields to update';
      return Response.json(response, { status: 400 });
    }

    logAudit(supabase, {
      action: 'admin_update_member',
      entityType: 'profile',
      entityId: id,
      actor: user!.username,
      metadata: { fields: [...Object.keys(profileUpdate), ...(body.password ? ['password'] : []), ...(body.email ? ['email'] : [])] },
    });

    response.data = { success: true };
    return Response.json(response);
  } catch (error) {
    console.error('Error updating member:', error);
    response.error = 'Internal server error';
    return Response.json(response, { status: 500 });
  }
}
