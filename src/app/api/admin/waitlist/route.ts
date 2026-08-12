import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

import { verifyAuth } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { approveWaitlistEntry } from '@/lib/waitlist';
import { createServerClient } from '@/plugins/supabase/server';
import type { FetchResponse } from '@/types/fetch';

export interface WaitlistItem {
  id: string;
  username: string;
  full_name: string;
  email: string;
  phone_number: string;
  address: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reject_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export async function GET(request: NextRequest) {
  const response: FetchResponse<WaitlistItem[]> = {};

  try {
    const { user, error: authError } = await verifyAuth(request);
    if (authError) return authError;

    if (user!.role !== 'SUPERADMIN') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore, true);

    const { searchParams } = new URL(request.url);
    const status = (searchParams.get('status') || 'PENDING') as WaitlistItem['status'];
    const search = searchParams.get('search');

    let query = supabase
      .from('member_waitlist')
      .select(
        'id, username, full_name, email, phone_number, address, status, reject_reason, reviewed_by, reviewed_at, created_at'
      )
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(
        `username.ilike.%${search}%,full_name.ilike.%${search}%,email.ilike.%${search}%,phone_number.ilike.%${search}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      response.error = error.message;
      return Response.json(response, { status: 500 });
    }

    response.data = data;
    return Response.json(response);
  } catch (error) {
    console.error('Error fetching waitlist:', error);
    response.error = 'Internal server error';
    return Response.json(response, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const response: FetchResponse<{ approved: string[]; failed: { id: string; error: string }[] }> = {};

  try {
    const { user, error: authError } = await verifyAuth(request);
    if (authError) return authError;

    if (user!.role !== 'SUPERADMIN') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore, true);
    const body = await request.json();

    const ids: string[] = Array.isArray(body.ids) ? body.ids : [];
    const action: 'approve' | 'reject' = body.action;
    const reason: string | undefined = body.reason;

    if (ids.length === 0 || (action !== 'approve' && action !== 'reject')) {
      response.error = 'ids and a valid action are required';
      return Response.json(response, { status: 400 });
    }

    if (action === 'reject') {
      const { error } = await supabase
        .from('member_waitlist')
        .update({
          status: 'REJECTED' as const,
          reject_reason: reason ?? null,
          reviewed_by: user!.username,
          reviewed_at: new Date().toISOString(),
        })
        .in('id', ids)
        .eq('status', 'PENDING');

      if (error) {
        response.error = error.message;
        return Response.json(response, { status: 500 });
      }

      await logAudit(supabase, {
        action: 'reject_member',
        entityType: 'member_waitlist',
        actor: user!.username,
        metadata: { ids, reason },
      });

      response.data = { approved: [], failed: [] };
      return Response.json(response);
    }

    const approved: string[] = [];
    const failed: { id: string; error: string }[] = [];

    for (const id of ids) {
      const result = await approveWaitlistEntry(supabase, id, user!.username);
      if (result.success) {
        approved.push(id);
      } else {
        failed.push({ id, error: result.error || 'Unknown error' });
      }
    }

    response.data = { approved, failed };
    return Response.json(response);
  } catch (error) {
    console.error('Error updating waitlist:', error);
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

    const { error } = await supabase.from('member_waitlist').delete().eq('id', id);

    if (error) {
      response.error = error.message;
      return Response.json(response, { status: 500 });
    }

    await logAudit(supabase, {
      action: 'delete_waitlist_entry',
      entityType: 'member_waitlist',
      entityId: id,
      actor: user!.username,
    });

    response.data = { id };
    return Response.json(response);
  } catch (error) {
    console.error('Error deleting waitlist entry:', error);
    response.error = 'Internal server error';
    return Response.json(response, { status: 500 });
  }
}
