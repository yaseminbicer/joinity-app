import { getSupabaseClient } from '@/lib/supabaseClient';

export async function getUser() {
  const supabase = await getSupabaseClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}
