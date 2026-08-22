'use client';
import { motion } from 'motion/react';
import { useSyncStatus } from '@/lib/sync/status';
import { db } from '@/lib/db/schema';
import { StatusBadge } from '@/components/ui/status-badge';

const LABEL = { synced: 'Synced', pending: 'Pending', offline: 'Offline' } as const;
const TONE = { synced: 'sage', pending: 'accent', offline: 'rust' } as const;

export function SyncIndicator() {
  const status = useSyncStatus(db);
  return (
    <span data-testid="sync-indicator" className="flex items-center gap-2 text-sm text-parchment">
      <motion.span
        animate={status !== 'synced' ? { scale: [1, 1.25, 1] } : { scale: 1 }}
        transition={{ duration: 1.2, repeat: status !== 'synced' ? Infinity : 0, ease: 'easeInOut' }}
      >
        <StatusBadge tone={TONE[status]} />
      </motion.span>
      {LABEL[status]}
    </span>
  );
}
