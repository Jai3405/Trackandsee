'use client';
import { useSyncStatus } from '@/lib/sync/status';
import { db } from '@/lib/db/schema';
import { StatusBadge } from '@/components/ui/status-badge';

const LABEL = { synced: 'Synced', pending: 'Pending', offline: 'Offline' } as const;
const TONE = { synced: 'sage', pending: 'brass', offline: 'rust' } as const;

export function SyncIndicator() {
  const status = useSyncStatus(db);
  return (
    <span data-testid="sync-indicator" className="flex items-center gap-2 text-sm text-parchment">
      <StatusBadge tone={TONE[status]} />
      {LABEL[status]}
    </span>
  );
}
