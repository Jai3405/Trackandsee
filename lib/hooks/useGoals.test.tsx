import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGoals, useCreateGoal } from './useGoals';
import { db } from '../db/schema';

vi.mock('../auth/session', () => ({
  useSession: () => ({ user: { id: 'u1' }, loading: false }),
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe('useCreateGoal', () => {
  it('writes the signed-in user id onto the created goal, not an empty string', async () => {
    const { result } = renderHook(() => useCreateGoal(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ title: 'Learn sync' });
    });

    const stored = await db.goals.toArray();
    expect(stored).toHaveLength(1);
    expect(stored[0].user_id).toBe('u1');
    expect(stored[0].title).toBe('Learn sync');

    const outbox = await db.outbox.toArray();
    expect(outbox).toHaveLength(1);
    expect(outbox[0].table).toBe('goals');
  });
});

describe('useGoals', () => {
  it('reads goals from Dexie, excluding soft-deleted rows', async () => {
    await db.goals.put({
      id: 'g1', user_id: 'u1', title: 'visible', target_date: null, status: 'open',
      created_at: '', updated_at: '', deleted_at: null,
    });
    await db.goals.put({
      id: 'g2', user_id: 'u1', title: 'gone', target_date: null, status: 'open',
      created_at: '', updated_at: '', deleted_at: '2026-01-01',
    });

    const { result } = renderHook(() => useGoals(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.map((g) => g.id)).toContain('g1');
    expect(result.current.data?.map((g) => g.id)).not.toContain('g2');
  });
});
