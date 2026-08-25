export interface Goal {
  id: string;
  user_id: string;
  title: string;
  target_date: string | null;
  status: 'open' | 'closed';
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Task {
  id: string;
  user_id: string;
  goal_id: string | null;
  title: string;
  kind: 'task' | 'event';
  done: boolean;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Expense {
  id: string;
  user_id: string;
  date: string;
  amount: number;
  kind: 'expense' | 'investment';
  current_value: number | null;
  description: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type SyncTable = 'goals' | 'tasks' | 'expenses';

export interface OutboxEntry {
  id: string;
  table: SyncTable;
  op: 'upsert' | 'delete';
  recordId: string;
  payload: Record<string, unknown> | null;
  clientUpdatedAt: string;
}
