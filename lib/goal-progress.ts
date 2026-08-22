import type { Task } from './db/types';

export function goalProgress(tasks: Task[]): { done: number; total: number } {
  const active = tasks.filter((t) => !t.deleted_at);
  return { done: active.filter((t) => t.done).length, total: active.length };
}
