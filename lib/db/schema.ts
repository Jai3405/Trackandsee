import Dexie, { type Table } from 'dexie';
import type { Goal, Task, Expense, OutboxEntry } from './types';

export class AppDB extends Dexie {
  goals!: Table<Goal, string>;
  tasks!: Table<Task, string>;
  expenses!: Table<Expense, string>;
  outbox!: Table<OutboxEntry, string>;
  meta!: Table<{ key: string; value: string }, string>;

  constructor() {
    super('trackandsee');
    // Later phases add tables via db.version(2).stores({ ...v1 stores, contacts: '...' })
    // — never edit this v1 block once shipped, Dexie versions are additive migrations.
    this.version(1).stores({
      goals: 'id, updated_at, deleted_at',
      tasks: 'id, goal_id, due_date, updated_at, deleted_at',
      outbox: 'id, table, recordId',
      meta: 'key',
    });
    this.version(2).stores({
      goals: 'id, updated_at, deleted_at',
      tasks: 'id, goal_id, due_date, updated_at, deleted_at',
      outbox: 'id, table, recordId',
      meta: 'key',
      expenses: 'id, date, updated_at, deleted_at',
    });
  }
}

export const db = new AppDB();
