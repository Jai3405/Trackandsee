'use client';
import { useEffect, useState } from 'react';
import type { AppDB } from '../db/schema';

export type SyncStatus = 'synced' | 'pending' | 'offline';

export function useSyncStatus(db: AppDB): SyncStatus {
  const [status, setStatus] = useState<SyncStatus>('synced');

  useEffect(() => {
    let cancelled = false;

    async function recompute() {
      if (!navigator.onLine) { if (!cancelled) setStatus('offline'); return; }
      const pending = await db.outbox.count();
      if (!cancelled) setStatus(pending > 0 ? 'pending' : 'synced');
    }

    recompute();
    const interval = setInterval(recompute, 2000);
    window.addEventListener('online', recompute);
    window.addEventListener('offline', recompute);
    return () => {
      cancelled = true;
      clearInterval(interval);
      window.removeEventListener('online', recompute);
      window.removeEventListener('offline', recompute);
    };
  }, [db]);

  return status;
}
