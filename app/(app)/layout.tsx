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
    const interval = setInterval(() => runSyncCycle(supabase, db), 30_000);
    const unsubscribeRealtime = subscribeRealtime(supabase, db, () => queryClient.invalidateQueries());
    const onOnline = () => runSyncCycle(supabase, db);
    window.addEventListener('online', onOnline);
    runSyncCycle(supabase, db);
    return () => {
      clearInterval(interval);
      unsubscribeRealtime();
      window.removeEventListener('online', onOnline);
    };
  }, [user]);

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
