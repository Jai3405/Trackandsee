import type { SupabaseClient } from '@supabase/supabase-js';
import type { AppDB } from '../db/schema';
import type { SyncTable } from '../db/types';
import { serverWins } from './lww';

export async function pushOutbox(supabase: SupabaseClient, db: AppDB): Promise<void> {
  const entries = (await db.outbox.toArray())
    .sort((a, b) => a.clientUpdatedAt.localeCompare(b.clientUpdatedAt));
  for (const entry of entries) {
    let result: { error: unknown };
    if (entry.op === 'delete') {
      result = await supabase.from(entry.table).update({ deleted_at: new Date().toISOString() }).eq('id', entry.recordId);
    } else {
      if (!entry.payload) throw new Error(`upsert outbox entry missing payload: ${entry.id}`);
      result = await supabase.from(entry.table).upsert(entry.payload);
    }
    if (!result.error) await db.outbox.delete(entry.id);
  }
}

export async function pullTable(supabase: SupabaseClient, db: AppDB, table: SyncTable, watermarkKey: string): Promise<void> {
  const watermarkRow = await db.meta.get(watermarkKey);
  const watermark = watermarkRow?.value ?? '1970-01-01T00:00:00Z';

  const { data, error } = await supabase.from(table).select('*').gt('updated_at', watermark);
  if (error || !data || data.length === 0) return;

  for (const remote of data) {
    const pending = await db.outbox.where({ table, recordId: remote.id }).first();
    if (!serverWins(pending?.clientUpdatedAt, remote.updated_at)) continue;
    if (pending) await db.outbox.delete(pending.id);
    if (table === 'goals') await db.goals.put(remote);
    else if (table === 'tasks') await db.tasks.put(remote);
    else await db.expenses.put(remote);
  }

  const latest = data.reduce((max, row) => (row.updated_at > max ? row.updated_at : max), watermark);
  await db.meta.put({ key: watermarkKey, value: latest });
}

export async function runSyncCycle(supabase: SupabaseClient, db: AppDB): Promise<void> {
  await pushOutbox(supabase, db);
  await pullTable(supabase, db, 'goals', 'goals_watermark');
  await pullTable(supabase, db, 'tasks', 'tasks_watermark');
  await pullTable(supabase, db, 'expenses', 'expenses_watermark');
}
