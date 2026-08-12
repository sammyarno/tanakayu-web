import { randomBytes } from 'crypto';

import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

import { verifyAuth } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { createServerClient } from '@/plugins/supabase/server';
import type { FetchResponse } from '@/types/fetch';
import { normalizePhone } from '@/utils/phone';

export interface InviteItem {
  id: string;
  token: string;
  full_name: string;
  phone_number: string | null;
  created_by: string;
  expires_at: string | null;
  used_at: string | null;
  revoked_at: string | null;
  created_at: string;
}

export async function GET(request: NextRequest) {
  const response: FetchResponse<InviteItem[]> = {};

  try {
    const { user, error: authError } = await verifyAuth(request);
    if (authError) return authError;

    if (user!.role !== 'SUPERADMIN') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore, true);

    const { data, error } = await supabase
      .from('member_invites')
      .select('id, token, full_name, phone_number, created_by, expires_at, used_at, revoked_at, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      response.error = error.message;
      return Response.json(response, { status: 500 });
    }

    response.data = data;
    return Response.json(response);
  } catch (error) {
    console.error('Error fetching invites:', error);
    response.error = 'Internal server error';
    return Response.json(response, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const response: FetchResponse<InviteItem> = {};

  try {
    const { user, error: authError } = await verifyAuth(request);
    if (authError) return authError;

    if (user!.role !== 'SUPERADMIN') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore, true);
    const body = await request.json();

    const token = randomBytes(32).toString('base64url');

    const { data, error } = await supabase
      .from('member_invites')
      .insert({
        token,
        full_name: body.full_name?.trim() || '',
        phone_number: body.phone_number ? normalizePhone(body.phone_number) : null,
        created_by: user!.username,
        expires_at: body.expires_at || null,
      })
      .select('id, token, full_name, phone_number, created_by, expires_at, used_at, revoked_at, created_at')
      .single();

    if (error) {
      response.error = error.message;
      return Response.json(response, { status: 500 });
    }

    await logAudit(supabase, {
      action: 'create_invite',
      entityType: 'member_invite',
      entityId: data.id,
      actor: user!.username,
    });

    response.data = data;
    return Response.json(response, { status: 200 });
  } catch (error) {
    console.error('Error creating invite:', error);
    response.error = 'Internal server error';
    return Response.json(response, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const response: FetchResponse<{ id: string }> = {};

  try {
    const { user, error: authError } = await verifyAuth(request);
    if (authError) return authError;

    if (user!.role !== 'SUPERADMIN') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore, true);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return Response.json({ error: 'ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('member_invites')
      .update({ revoked_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      response.error = error.message;
      return Response.json(response, { status: 500 });
    }

    await logAudit(supabase, {
      action: 'revoke_invite',
      entityType: 'member_invite',
      entityId: id,
      actor: user!.username,
    });

    response.data = { id };
    return Response.json(response);
  } catch (error) {
    console.error('Error revoking invite:', error);
    response.error = 'Internal server error';
    return Response.json(response, { status: 500 });
  }
}
