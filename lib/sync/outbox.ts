import type { AppDB } from '../db/schema';
import type { OutboxEntry } from '../db/types';

export async function enqueue(db: AppDB, entry: Omit<OutboxEntry, 'id'>): Promise<void> {
  await db.outbox.add({ ...entry, id: crypto.randomUUID() });
}
