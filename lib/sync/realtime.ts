import type { SupabaseClient } from '@supabase/supabase-js';
import type { AppDB } from '../db/schema';
import { runSyncCycle } from './engine';

export function subscribeRealtime(supabase: SupabaseClient, db: AppDB, onChange: () => void): () => void {
  const channel = supabase
    .channel('trackandsee-sync')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'goals' }, () => {
      runSyncCycle(supabase, db).then(onChange);
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
      runSyncCycle(supabase, db).then(onChange);
    })
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}
