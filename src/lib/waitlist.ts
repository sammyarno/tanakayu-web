import { SupabaseClient } from '@supabase/supabase-js';

import { logAudit } from '@/lib/audit';

interface ApproveResult {
  success: boolean;
  userId?: string;
  error?: string;
}

/**
 * Turns a pending member_waitlist entry into a real, logged-in-able account.
 * Shared by the invite auto-approve path and the admin approval endpoint.
 */
export async function approveWaitlistEntry(
  supabase: SupabaseClient,
  entryId: string,
  actor: string
): Promise<ApproveResult> {
  const { data: entry, error: entryError } = await supabase
    .from('member_waitlist')
    .select('id, username, full_name, email, phone_number, address, status')
    .eq('id', entryId)
    .single();

  if (entryError || !entry) {
    return { success: false, error: 'Waitlist entry not found' };
  }

  if (entry.status !== 'PENDING') {
    return { success: false, error: `Entry is already ${entry.status.toLowerCase()}` };
  }

  const { data: secret, error: secretError } = await supabase
    .from('member_waitlist_secrets')
    .select('password_hash')
    .eq('waitlist_id', entryId)
    .single();

  if (secretError || !secret) {
    return { success: false, error: 'Stored credentials not found for this entry' };
  }

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: entry.email,
    password: crypto.randomUUID(),
    email_confirm: true,
    user_metadata: { username: entry.username, full_name: entry.full_name },
  });

  if (authError || !authData.user) {
    return { success: false, error: authError?.message || 'Failed to create user' };
  }

  const userId = authData.user.id;

  const { error: hashError } = await supabase.rpc('set_user_password_hash', {
    p_user_id: userId,
    p_hash: secret.password_hash,
  });

  if (hashError) {
    await supabase.auth.admin.deleteUser(userId);
    return { success: false, error: 'Failed to set password' };
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      username: entry.username,
      full_name: entry.full_name,
      phone_number: entry.phone_number,
      address: entry.address,
      role: 'MEMBER' as const,
    })
    .eq('id', userId);

  if (profileError) {
    console.error('Error updating profile:', profileError);
    await supabase.auth.admin.deleteUser(userId);
    return { success: false, error: 'Failed to create profile' };
  }

  const { error: updateError } = await supabase
    .from('member_waitlist')
    .update({
      status: 'APPROVED' as const,
      approved_user_id: userId,
      reviewed_by: actor,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', entryId);

  if (updateError) {
    console.error('Error updating waitlist entry:', updateError);
    await supabase.auth.admin.deleteUser(userId);
    return { success: false, error: 'Failed to finalize approval' };
  }

  // Password hash no longer needed once it's copied onto the auth user.
  await supabase.from('member_waitlist_secrets').delete().eq('waitlist_id', entryId);

  await logAudit(supabase, {
    action: 'approve_member',
    entityType: 'user',
    entityId: userId,
    actor,
  });

  return { success: true, userId };
}
