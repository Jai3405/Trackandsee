import { describe, it, expect } from 'vitest';
import { goalProgress } from './goal-progress';
import type { Task } from './db/types';

const task = (overrides: Partial<Task>): Task => ({
  id: 't', user_id: 'u', goal_id: 'g', title: 'x', kind: 'task', done: false,
  due_date: null, created_at: '', updated_at: '', deleted_at: null, ...overrides,
});

describe('goalProgress', () => {
  it('counts done vs total, ignoring deleted tasks', () => {
    const tasks = [task({ done: true }), task({ done: false }), task({ done: true, deleted_at: '2026-01-01' })];
    expect(goalProgress(tasks)).toEqual({ done: 1, total: 2 });
  });
});
