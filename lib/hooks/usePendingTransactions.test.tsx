import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useApprovePendingTransaction } from './usePendingTransactions';
import { db } from '../db/schema';

vi.mock('../auth/session', () => ({
  useSession: () => ({ user: { id: 'u1' }, loading: false }),
}));

const updateMock = vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ error: null })) }));
vi.mock('@/lib/supabase/client', () => ({
  getSupabaseClient: () => ({
    from: vi.fn(() => ({ update: updateMock })),
  }),
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe('useApprovePendingTransaction', () => {
  it('writes an expense reusing the pending transaction id, with only the expected fields set', async () => {
    const { result } = renderHook(() => useApprovePendingTransaction(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ id: 'pt-1', amount: 250, description: 'Coffee', date: '2026-01-01' });
    });

    const stored = await db.expenses.toArray();
    expect(stored).toHaveLength(1);
    // The expense id matches the pending transaction id (not a fresh random
    // uuid) — this is what makes a retried approve overwrite instead of
    // duplicating the expense.
    expect(stored[0].id).toBe('pt-1');
    expect(stored[0].kind).toBe('expense');
    expect(stored[0].amount).toBe(250);
    expect(stored[0].date).toBe('2026-01-01');
    expect(stored[0].description).toBe('Coffee');
    expect(stored[0]).not.toHaveProperty('raw_snippet');
    expect(stored[0]).not.toHaveProperty('merchant');
    expect(stored[0]).not.toHaveProperty('category_guess');

    expect(updateMock).toHaveBeenCalledWith({ status: 'approved' });
  });
});
