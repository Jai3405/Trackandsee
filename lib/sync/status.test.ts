import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AppDB } from '../db/schema';
import { useSyncStatus } from './status';

describe('useSyncStatus', () => {
  let db: AppDB;
  beforeEach(async () => { db = new AppDB(); await db.open(); });

  it('reports offline when navigator.onLine is false', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    const { result } = renderHook(() => useSyncStatus(db));
    expect(result.current).toBe('offline');
  });

  it('reports pending when the outbox has entries', async () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    await db.outbox.add({ id: 'o1', table: 'goals', op: 'upsert', recordId: 'g1', payload: {}, clientUpdatedAt: '2026-01-01T00:00:00Z' });
    const { result } = renderHook(() => useSyncStatus(db));
    await act(async () => {});
    expect(result.current).toBe('pending');
  });
});
