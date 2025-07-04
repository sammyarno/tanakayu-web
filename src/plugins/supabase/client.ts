import type { Database } from '@/database/supabase';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

let supabase: ReturnType<typeof createClient<Database>> | null = null;

export const getSupabaseClient = () => {
  if (!supabase) {
    supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return supabase;
};
