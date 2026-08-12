import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

import { logAudit } from '@/lib/audit';
import { registerSchema } from '@/lib/validations/auth';
import { approveWaitlistEntry } from '@/lib/waitlist';
import { createServerClient } from '@/plugins/supabase/server';
import { normalizePhone } from '@/utils/phone';

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

    const { username, full_name, email, password, phone_number, address, cluster, invite_token } =
      validationResult.data;

    const normalizedPhone = normalizePhone(phone_number);
    const fullAddress = `${cluster}, ${address}`;

    const [usernameResult, waitlistResult] = await Promise.all([
      supabase.from('profiles').select('id').eq('username', username).single(),
      supabase
        .from('member_waitlist')
        .select('id, status')
        .or(`username.ilike.${username},email.ilike.${email},phone_number.eq.${normalizedPhone}`)
        .maybeSingle(),
    ]);

    if (usernameResult.data) {
      return Response.json({ error: 'Username already taken' }, { status: 409 });
    }

    if (waitlistResult.data) {
      if (waitlistResult.data.status === 'REJECTED') {
        return Response.json(
          { error: 'This registration was declined. Please contact the administrator.' },
          { status: 403 }
        );
      }
      return Response.json({ error: 'A registration with these details is already pending review.' }, { status: 409 });
    }

    let inviteId: string | null = null;
    if (invite_token) {
      const nowIso = new Date().toISOString();
      const { data: invite } = await supabase
        .from('member_invites')
        .select('id, phone_number')
        .eq('token', invite_token)
        .is('used_at', null)
        .is('revoked_at', null)
        .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
        .maybeSingle();

      if (invite && (!invite.phone_number || invite.phone_number === normalizedPhone)) {
        inviteId = invite.id;
      }
    }

    const { data: waitlistId, error: submitError } = await supabase.rpc('submit_waitlist', {
      p_username: username,
      p_full_name: full_name,
      p_email: email,
      p_phone_number: normalizedPhone,
      p_address: fullAddress,
      p_password: password,
      p_invite_id: inviteId ?? undefined,
    });

    if (submitError || !waitlistId) {
      console.error('Error submitting waitlist entry:', submitError);
      return Response.json({ error: 'Failed to submit registration' }, { status: 500 });
    }

    logAudit(supabase, {
      action: 'register',
      entityType: 'member_waitlist',
      entityId: waitlistId,
      actor: username,
    });

    if (inviteId) {
      const approval = await approveWaitlistEntry(supabase, waitlistId, `invite:${invite_token}`);
      if (!approval.success) {
        console.error('Error auto-approving invited registration:', approval.error);
        return Response.json({ approved: false }, { status: 200 });
      }

      await supabase.from('member_invites').update({ used_at: new Date().toISOString() }).eq('id', inviteId);

      return Response.json({ approved: true, id: approval.userId }, { status: 200 });
    }

    return Response.json({ approved: false, id: waitlistId }, { status: 200 });
  } catch (error) {
    console.error('Error registering user:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
