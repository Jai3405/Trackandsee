'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSession } from '@/lib/auth/session';
import { getSupabaseClient } from '@/lib/supabase/client';
import { db } from '@/lib/db/schema';
import { runSyncCycle } from '@/lib/sync/engine';
import { subscribeRealtime } from '@/lib/sync/realtime';
import { WorkspaceSwitcher } from '@/components/workspace-switcher';
import { SyncIndicator } from '@/components/sync-indicator';

const queryClient = new QueryClient();

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    const supabase = getSupabaseClient();
    // Backstop for reconnect-triggered sync: some browsers/automation contexts
    // (notably Chromium under devtools-protocol offline emulation) never fire a
    // window 'online' event even though navigator.onLine flips correctly, so a
    // short poll is what actually gets a pending outbox flushed on reconnect —
    // the 'online' listener below still gets real users a near-instant sync too.
    const interval = setInterval(() => runSyncCycle(supabase, db), 5_000);
    const unsubscribeRealtime = subscribeRealtime(supabase, db, () => queryClient.invalidateQueries());
    const onOnline = () => runSyncCycle(supabase, db);
    window.addEventListener('online', onOnline);
    runSyncCycle(supabase, db);
    return () => {
      clearInterval(interval);
      unsubscribeRealtime();
      window.removeEventListener('online', onOnline);
    };
    // Keyed on user id, not object identity: Supabase mints a new `user` object on
    // every TOKEN_REFRESHED event, which would otherwise tear down and resubscribe
    // the sync loop hourly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (loading || !user) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-parchment">
        <header className="flex items-center justify-between bg-indigo-900 px-4 py-3">
          <WorkspaceSwitcher />
          <SyncIndicator />
        </header>
        <main>{children}</main>
      </div>
    </QueryClientProvider>
  );
}
