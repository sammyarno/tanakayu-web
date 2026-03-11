import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

import { verifyAuth } from '@/lib/auth';
import { createServerClient } from '@/plugins/supabase/server';
import type { FetchResponse } from '@/types/fetch';

export interface MemberListItem {
  id: string;
  username: string;
  full_name: string;
  phone_number: string;
  address: string;
  role: string;
  created_at: string;
  email?: string;
}

export async function GET(request: NextRequest) {
  const response: FetchResponse<MemberListItem[]> = {};

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
      .from('profiles')
      .select('id, username, full_name, phone_number, address, role, created_at')
      .neq('id', user!.id)
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(
        `username.ilike.%${search}%,full_name.ilike.%${search}%,phone_number.ilike.%${search}%,address.ilike.%${search}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      response.error = error.message;
      return Response.json(response, { status: 500 });
    }

    // Fetch emails in parallel for all members
    const memberIds = (data ?? []).map(m => m.id);
    const emailMap = new Map<string, string>();

    if (memberIds.length > 0) {
      const { data: authData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
      if (authData?.users) {
        for (const u of authData.users) {
          if (u.email) emailMap.set(u.id, u.email);
        }
      }
    }

    const members: MemberListItem[] = (data ?? []).map(m => ({
      ...m,
      email: emailMap.get(m.id) || '',
    }));

    response.data = members;
    return Response.json(response);
  } catch (error) {
    console.error('Error fetching members:', error);
    response.error = 'Internal server error';
    return Response.json(response, { status: 500 });
  }
}
