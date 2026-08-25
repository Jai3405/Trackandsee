'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseClient } from '@/lib/supabase/client';
import { usePendingTransactions, useApprovePendingTransaction, useDiscardPendingTransaction, type PendingTransaction } from '@/lib/hooks/usePendingTransactions';
import { FrameCard } from '@/components/ui/frame-card';
import { EmptyState } from '@/components/ui/empty-state';

const SCAN_ERROR_MESSAGES: Record<string, string> = {
  gmail_not_connected: 'Connect Gmail first',
  gmail_reconnect_required: 'Gmail connection expired — reconnect',
};

export default function TransactionsPage() {
  const { data: pending } = usePendingTransactions();
  const approve = useApprovePendingTransaction();
  const discard = useDiscardPendingTransaction();
  const queryClient = useQueryClient();
  const [scanMessage, setScanMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const scan = useMutation({
    mutationFn: async () => {
      const {
        data: { session },
      } = await getSupabaseClient().auth.getSession();
      if (!session) throw new Error('not_signed_in');
      const res = await fetch('/api/gmail/scan', { method: 'POST', headers: { Authorization: `Bearer ${session.access_token}` } });
      const body = (await res.json()) as { inserted?: number; error?: string };
      if (!res.ok) throw new Error(body.error ?? 'unknown');
      return body as { inserted: number };
    },
    onSuccess: ({ inserted }) => {
      queryClient.invalidateQueries({ queryKey: ['pending-transactions'] });
      setScanMessage(inserted === 0 ? { text: 'No new transactions found', isError: false } : null);
    },
    onError: (error: Error) => {
      setScanMessage({ text: SCAN_ERROR_MESSAGES[error.message] ?? "Couldn't check for new transactions", isError: true });
    },
  });

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl">Transactions</h1>
        <button
          onClick={() => scan.mutate()}
          disabled={scan.isPending}
          className="rounded-lg bg-accent px-4 py-2 text-parchment disabled:cursor-not-allowed disabled:opacity-50"
        >
          {scan.isPending ? 'Checking…' : 'Check for new transactions'}
        </button>
      </div>
      {scanMessage && (
        <p className={`mb-4 text-sm ${scanMessage.isError ? 'text-rust' : 'text-ink/60'}`}>
          {scanMessage.text}
          {scanMessage.text === SCAN_ERROR_MESSAGES.gmail_not_connected && (
            <>
              {' '}
              <Link href="/personal/settings" className="underline">
                Go to Settings
              </Link>
            </>
          )}
        </p>
      )}
      {!pending || pending.length === 0 ? (
        <EmptyState title="Nothing pending" description='Tap "Check for new transactions" to scan your inbox.' />
      ) : (
        <div className="flex flex-col gap-3">
          {pending.map((tx) => (
            <PendingRow key={tx.id} tx={tx} onApprove={approve.mutateAsync} onDiscard={discard.mutateAsync} approveError={approve.isError && approve.variables?.id === tx.id} />
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
  approveError,
}: {
  tx: PendingTransaction;
  onApprove: (input: { id: string; amount: number; description: string; date: string }) => Promise<void>;
  onDiscard: (id: string) => Promise<void>;
  approveError: boolean;
}) {
  const [amount, setAmount] = useState(tx.amount?.toString() ?? '');
  const [description, setDescription] = useState(
    tx.merchant ? `${tx.merchant}${tx.category_guess ? ` (${tx.category_guess})` : ''}` : '',
  );
  const parsedAmount = Number(amount);
  const isValidAmount = amount.trim() !== '' && !Number.isNaN(parsedAmount);

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
          onClick={() => onApprove({ id: tx.id, amount: parsedAmount, description, date: tx.occurred_at.slice(0, 10) })}
          disabled={!isValidAmount}
          className="rounded-lg bg-accent px-3 py-1 text-sm text-parchment disabled:cursor-not-allowed disabled:opacity-50"
        >
          Approve
        </button>
        <button onClick={() => onDiscard(tx.id)} className="rounded-lg border px-3 py-1 text-sm">
          Discard
        </button>
      </div>
      {approveError && <p className="mt-2 text-xs text-rust">Couldn&apos;t save — try again.</p>}
    </FrameCard>
  );
}
