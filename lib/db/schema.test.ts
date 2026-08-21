import { describe, it, expect, beforeEach } from 'vitest';
import { AppDB } from './schema';

describe('AppDB', () => {
  let db: AppDB;

  beforeEach(async () => {
    db = new AppDB();
    await db.open();
  });

  it('stores and retrieves a goal', async () => {
    await db.goals.put({
      id: 'g1', user_id: 'u1', title: 'Launch spring collection', target_date: null,
      status: 'open', created_at: '2026-01-01', updated_at: '2026-01-01', deleted_at: null,
    });
    const goal = await db.goals.get('g1');
    expect(goal?.title).toBe('Launch spring collection');
  });

  it('queues an outbox entry', async () => {
    await db.outbox.add({
      id: 'o1', table: 'goals', op: 'upsert', recordId: 'g1',
      payload: { title: 'x' }, clientUpdatedAt: '2026-01-01T00:00:00Z',
    });
    expect(await db.outbox.count()).toBe(1);
  });
});
