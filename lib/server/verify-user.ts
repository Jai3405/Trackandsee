import { createClient } from '@supabase/supabase-js';

export async function verifyUser(accessToken: string): Promise<string | null> {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data.user) return null;
  return data.user.id;
}

export function userScopedClient(accessToken: string) {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}
