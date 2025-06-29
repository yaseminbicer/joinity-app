import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabase: SupabaseClient | null = null;

export const getSupabaseClient = async (): Promise<SupabaseClient> => {
  if (supabase) return supabase;
  const res = await fetch('/api/supabase-config');
  const { supabaseUrl, supabaseAnonKey } = await res.json();
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  return supabase;
};
