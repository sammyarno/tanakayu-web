import type { Database } from '@/database/supabase';
import { createBrowserClient } from '@supabase/ssr';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

let supabase: ReturnType<typeof createBrowserClient<Database>> | null = null;

export const getSupabaseClient = () => {
  if (!supabase) {
    supabase = createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return supabase;
};
