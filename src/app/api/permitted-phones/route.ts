import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

import { logAudit } from '@/lib/audit';
import { verifyAuth } from '@/lib/auth';
import { createServerClient } from '@/plugins/supabase/server';
import type { FetchResponse, SimpleResponse } from '@/types/fetch';
import { normalizePhone } from '@/utils/phone';

const PHONE_REGEX = /^(\+62|62|0)8[1-9][0-9]{6,10}$/;

export async function GET(request: NextRequest) {
  const response: FetchResponse<any> = {};

  try {
    const { user, error: authError } = await verifyAuth(request);
    if (authError) return authError;

    if (user!.role !== 'SUPERADMIN') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore, true);

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    let query = supabase
      .from('permitted_phones')
      .select('id, phone_number, full_name, registered_by, created_at')
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`phone_number.ilike.%${search}%,full_name.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      response.error = error.message;
      return Response.json(response, { status: 500 });
    }

    response.data = data;
    return Response.json(response);
  } catch (error) {
    console.error('Error fetching permitted phones:', error);
    response.error = 'Internal server error';
    return Response.json(response, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const response: FetchResponse<any> = {};

  try {
    const { user, error: authError } = await verifyAuth(request);
    if (authError) return authError;

    if (user!.role !== 'SUPERADMIN') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore, true);
    const body = await request.json();

    // Support single { phone_number, full_name } or bulk { phones: [{ phone_number, full_name }] }
    const entries: { phone_number: string; full_name: string }[] = body.phones
      ? body.phones
      : [{ phone_number: body.phone_number, full_name: body.full_name || '' }];

    // Validate all phone numbers
    const invalid = entries.filter(e => !PHONE_REGEX.test(e.phone_number.trim()));
    if (invalid.length > 0) {
      response.error = `Nomor tidak valid: ${invalid.map(e => e.phone_number).join(', ')}`;
      return Response.json(response, { status: 400 });
    }

    const rows = entries.map(e => ({
      phone_number: normalizePhone(e.phone_number),
      full_name: e.full_name?.trim() || '',
      registered_by: user!.username,
    }));

    // Check for existing numbers
    const phoneNumbers = rows.map(r => r.phone_number);
    const { data: existing } = await supabase
      .from('permitted_phones')
      .select('phone_number')
      .in('phone_number', phoneNumbers);

    const existingSet = new Set((existing ?? []).map(e => e.phone_number));
    const duplicates = phoneNumbers.filter(p => existingSet.has(p));

    if (duplicates.length > 0) {
      response.error = `Number already registered: ${duplicates.join(', ')}`;
      return Response.json(response, { status: 409 });
    }

    const { data, error } = await supabase
      .from('permitted_phones')
      .insert(rows)
      .select('id, phone_number, full_name');

    if (error) {
      response.error = error.message;
      return Response.json(response, { status: 500 });
    }

    await logAudit(supabase, {
      action: 'create',
      entityType: 'permitted_phone',
      actor: user!.username,
      metadata: { count: rows.length },
    });

    response.data = data;
    return Response.json(response, { status: 200 });
  } catch (error) {
    console.error('Error adding permitted phone:', error);
    response.error = 'Internal server error';
    return Response.json(response, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const response: FetchResponse<SimpleResponse> = {};

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
      .from('permitted_phones')
      .delete()
      .eq('id', id);

    if (error) {
      response.error = error.message;
      return Response.json(response, { status: 500 });
    }

    await logAudit(supabase, {
      action: 'delete',
      entityType: 'permitted_phone',
      entityId: id,
      actor: user!.username,
    });

    response.data = { id };
    return Response.json(response);
  } catch (error) {
    console.error('Error deleting permitted phone:', error);
    response.error = 'Internal server error';
    return Response.json(response, { status: 500 });
  }
}
