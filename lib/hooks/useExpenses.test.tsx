import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useExpenses, useCreateExpense } from './useExpenses';
import { db } from '../db/schema';

vi.mock('../auth/session', () => ({
  useSession: () => ({ user: { id: 'u1' }, loading: false }),
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe('useCreateExpense', () => {
  it('writes the signed-in user id onto the created expense, not an empty string', async () => {
    const { result } = renderHook(() => useCreateExpense(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ date: '2026-01-01', amount: 347, kind: 'expense', description: 'Swiggy' });
    });

    const stored = await db.expenses.toArray();
    expect(stored).toHaveLength(1);
    expect(stored[0].user_id).toBe('u1');
    expect(stored[0].description).toBe('Swiggy');

    const outbox = await db.outbox.toArray();
    expect(outbox).toHaveLength(1);
    expect(outbox[0].table).toBe('expenses');
  });
});

describe('useExpenses', () => {
  it('reads expenses from Dexie, excluding soft-deleted rows', async () => {
    await db.expenses.put({
      id: 'e1', user_id: 'u1', date: '2026-01-01', amount: 100, kind: 'expense',
      current_value: null, description: 'visible', created_at: '', updated_at: '', deleted_at: null,
    });
    await db.expenses.put({
      id: 'e2', user_id: 'u1', date: '2026-01-01', amount: 50, kind: 'expense',
      current_value: null, description: 'gone', created_at: '', updated_at: '', deleted_at: '2026-01-01',
    });

    const { result } = renderHook(() => useExpenses(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.map((e) => e.id)).toContain('e1');
    expect(result.current.data?.map((e) => e.id)).not.toContain('e2');
  });
});
