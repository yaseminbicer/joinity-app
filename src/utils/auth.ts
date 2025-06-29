import { supabase } from '@/lib/supabaseClient';

export async function getUser() {

  const { data } = await supabase.auth.getUser();
  return data.user;
}
