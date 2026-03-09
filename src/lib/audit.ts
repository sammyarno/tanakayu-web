import { SupabaseClient } from '@supabase/supabase-js';

import { getNowDate } from '@/utils/date';

interface AuditLogEntry {
  action: string;
  entityType: string;
  entityId?: string;
  actor: string;
  metadata?: Record<string, any>;
}

export async function logAudit(supabase: SupabaseClient, entry: AuditLogEntry) {
  const { error } = await supabase.from('audit_logs').insert({
    action: entry.action,
    entity_type: entry.entityType,
    entity_id: entry.entityId ?? null,
    actor: entry.actor,
    metadata: entry.metadata ?? null,
    created_at: getNowDate(),
  });

  if (error) {
    console.error('Failed to write audit log:', error.message);
  }
}
