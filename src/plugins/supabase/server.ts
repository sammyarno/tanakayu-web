import { cookies } from 'next/headers';

import type { Database } from '@/database/supabase';
import { createServerClient as createServerClientFunc } from '@supabase/ssr';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

type AwaitedCookiesType = Awaited<ReturnType<typeof cookies>>;

export const createServerClient = (cookieStore: AwaitedCookiesType, doForceAuth = false) => {
  const key = doForceAuth ? SUPABASE_SERVICE_KEY : SUPABASE_ANON_KEY;
  return createServerClientFunc<Database>(SUPABASE_URL!, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
};
