import { useEffect } from 'react';

import { useAuth } from '@/hooks/auth/useAuth';
import { getSupabaseClient } from '@/plugins/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

/** Live-notifies SUPERADMINs of new self-registrations landing in the waitlist. */
export const useWaitlistRealtime = () => {
  const { role } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (role !== 'SUPERADMIN') return;

    const supabase = getSupabaseClient();
    const channel = supabase
      .channel('member-waitlist-inserts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'member_waitlist' },
        () => {
          toast.info('New member registration awaiting approval');
          queryClient.invalidateQueries({ queryKey: ['waitlist'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [role, queryClient]);
};
