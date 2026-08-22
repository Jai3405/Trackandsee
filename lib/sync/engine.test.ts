import { describe, it, expect, beforeEach } from 'vitest';
import { AppDB } from '../db/schema';
import { pullTable, pushOutbox } from './engine';

function fakeSupabase(selectRows: any[]) {
  const upserted: any[] = [];
  const updated: { payload: any; id: any }[] = [];
  return {
    upserted,
    updated,
    from: () => ({
      select: () => ({ gt: () => Promise.resolve({ data: selectRows, error: null }) }),
      upsert: (payload: any) => { upserted.push(payload); return Promise.resolve({ error: null }); },
      update: (payload: any) => ({
        eq: (_col: string, id: any) => { updated.push({ payload, id }); return Promise.resolve({ error: null }); },
      }),
    }),
  } as any;
}

describe('pushOutbox', () => {
  it('drains the outbox on success', async () => {
    const db = new AppDB(); await db.open();
    await db.outbox.add({ id: 'o1', table: 'goals', op: 'upsert', recordId: 'g1', payload: { id: 'g1', title: 'x' }, clientUpdatedAt: '2026-01-01T00:00:00Z' });
    const supabase = fakeSupabase([]);

    await pushOutbox(supabase, db);

    expect(await db.outbox.count()).toBe(0);
    expect(supabase.upserted).toHaveLength(1);
  });

  it('soft-deletes via update, never a hard delete', async () => {
    const db = new AppDB(); await db.open();
    await db.outbox.add({ id: 'o3', table: 'tasks', op: 'delete', recordId: 't3', payload: null, clientUpdatedAt: '2026-01-01T00:00:00Z' });
    const supabase = fakeSupabase([]);

    await pushOutbox(supabase, db);

    expect(await db.outbox.count()).toBe(0);
    expect(supabase.upserted).toHaveLength(0);
    expect(supabase.updated).toHaveLength(1);
    expect(supabase.updated[0].id).toBe('t3');
    expect(supabase.updated[0].payload).toHaveProperty('deleted_at');
  });
});

describe('pullTable', () => {
  it('drops a stale local pending edit when the server has a newer version', async () => {
    const db = new AppDB(); await db.open();
    await db.tasks.put({ id: 't1', user_id: 'u1', goal_id: null, title: 'old', kind: 'task', done: false, due_date: null, created_at: '2026-01-01', updated_at: '2026-01-01', deleted_at: null });
    await db.outbox.add({ id: 'o1', table: 'tasks', op: 'upsert', recordId: 't1', payload: { title: 'local edit' }, clientUpdatedAt: '2026-01-01T00:00:00Z' });

    const supabase = fakeSupabase([{ id: 't1', user_id: 'u1', goal_id: null, title: 'server edit', kind: 'task', done: false, due_date: null, created_at: '2026-01-01', updated_at: '2026-01-02T00:00:00Z', deleted_at: null }]);

    await pullTable(supabase, db, 'tasks', 'tasks_watermark');

    expect((await db.tasks.get('t1'))?.title).toBe('server edit');
    expect(await db.outbox.get('o1')).toBeUndefined();
  });

  it('keeps a local pending edit newer than the incoming server row', async () => {
    const db = new AppDB(); await db.open();
    await db.outbox.add({ id: 'o2', table: 'tasks', op: 'upsert', recordId: 't2', payload: { title: 'local newer' }, clientUpdatedAt: '2026-01-05T00:00:00Z' });

    const supabase = fakeSupabase([{ id: 't2', user_id: 'u1', goal_id: null, title: 'server older', kind: 'task', done: false, due_date: null, created_at: '2026-01-01', updated_at: '2026-01-02T00:00:00Z', deleted_at: null }]);

    await pullTable(supabase, db, 'tasks', 'tasks_watermark');

    expect(await db.outbox.get('o2')).toBeDefined();
  });

  it('writes an incoming server row straight through when there is no pending outbox entry', async () => {
    const db = new AppDB(); await db.open();

    const supabase = fakeSupabase([{ id: 't4', user_id: 'u1', goal_id: null, title: 'from server', kind: 'task', done: false, due_date: null, created_at: '2026-01-01', updated_at: '2026-01-02T00:00:00Z', deleted_at: null }]);

    await pullTable(supabase, db, 'tasks', 'tasks_watermark');

    expect((await db.tasks.get('t4'))?.title).toBe('from server');
  });
});
