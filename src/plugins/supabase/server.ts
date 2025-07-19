import { cookies } from 'next/headers';

import type { Database } from '@/database/supabase';
import { createServerClient as createServerClientFunc } from '@supabase/ssr';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Define a common interface for cookie operations
interface CookieStore {
  getAll: () => { name: string; value: string }[];
  setAll: (cookies: { name: string; value: string; options?: any }[]) => void;
}

export const createServerClient = (cookieStore: CookieStore) => {
  return createServerClientFunc<Database>(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookieStore.setAll(cookiesToSet);
      },
    },
  });
};
