'use client';
import { useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { usePendingTransactions, useApprovePendingTransaction, useDiscardPendingTransaction, type PendingTransaction } from '@/lib/hooks/usePendingTransactions';
import { FrameCard } from '@/components/ui/frame-card';
import { EmptyState } from '@/components/ui/empty-state';

export default function TransactionsPage() {
  const { data: pending } = usePendingTransactions();
  const approve = useApprovePendingTransaction();
  const discard = useDiscardPendingTransaction();

  async function handleScan() {
    const {
      data: { session },
    } = await getSupabaseClient().auth.getSession();
    if (!session) return;
    await fetch('/api/gmail/scan', { method: 'POST', headers: { Authorization: `Bearer ${session.access_token}` } });
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl">Transactions</h1>
        <button onClick={handleScan} className="rounded-lg bg-accent px-4 py-2 text-parchment">
          Check for new transactions
        </button>
      </div>
      {!pending || pending.length === 0 ? (
        <EmptyState title="Nothing pending" description='Tap "Check for new transactions" to scan your inbox.' />
      ) : (
        <div className="flex flex-col gap-3">
          {pending.map((tx) => (
            <PendingRow key={tx.id} tx={tx} onApprove={approve.mutateAsync} onDiscard={discard.mutateAsync} />
          ))}
        </div>
      )}
    </div>
  );
}

function PendingRow({
  tx,
  onApprove,
  onDiscard,
}: {
  tx: PendingTransaction;
  onApprove: (input: { id: string; amount: number; description: string; date: string }) => Promise<void>;
  onDiscard: (id: string) => Promise<void>;
}) {
  const [amount, setAmount] = useState(tx.amount?.toString() ?? '');
  const [description, setDescription] = useState(
    tx.merchant ? `${tx.merchant}${tx.category_guess ? ` (${tx.category_guess})` : ''}` : '',
  );

  return (
    <FrameCard className="p-4">
      {!tx.amount && (
        <p className="mb-2 text-sm text-rust">Couldn&apos;t parse this email automatically — check details below.</p>
      )}
      <input
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount"
        className="mb-2 w-full rounded-lg border px-3 py-2"
      />
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        className="mb-2 w-full rounded-lg border px-3 py-2"
      />
      {tx.raw_snippet && <p className="mb-2 text-xs text-ink/60">{tx.raw_snippet}</p>}
      <div className="flex gap-2">
        <button
          onClick={() => onApprove({ id: tx.id, amount: Number(amount), description, date: tx.occurred_at.slice(0, 10) })}
          className="rounded-lg bg-accent px-3 py-1 text-sm text-parchment"
        >
          Approve
        </button>
        <button onClick={() => onDiscard(tx.id)} className="rounded-lg border px-3 py-1 text-sm">
          Discard
        </button>
      </div>
    </FrameCard>
  );
}
