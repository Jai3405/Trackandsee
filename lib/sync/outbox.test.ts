import { describe, it, expect, beforeEach } from 'vitest';
import { AppDB } from '../db/schema';
import { enqueue } from './outbox';

describe('enqueue', () => {
  let db: AppDB;
  beforeEach(async () => { db = new AppDB(); await db.open(); });

  it('adds an outbox entry with a generated id', async () => {
    await enqueue(db, { table: 'goals', op: 'upsert', recordId: 'g1', payload: { title: 'x' }, clientUpdatedAt: '2026-01-01T00:00:00Z' });
    const entries = await db.outbox.toArray();
    expect(entries).toHaveLength(1);
    expect(entries[0].recordId).toBe('g1');
  });
});
