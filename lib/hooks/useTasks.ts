'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '../db/schema';
import { enqueue } from '../sync/outbox';
import { useSession } from '../auth/session';
import type { Task } from '../db/types';

export function useTasks(goalId?: string) {
  return useQuery({
    queryKey: ['tasks', goalId ?? 'all'],
    queryFn: async () => {
      const all = (await db.tasks.toArray()).filter((t) => !t.deleted_at);
      return goalId ? all.filter((t) => t.goal_id === goalId) : all;
    },
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  const { user } = useSession();
  return useMutation({
    mutationFn: async (input: { title: string; goal_id?: string | null; due_date?: string | null; kind?: 'task' | 'event' }) => {
      const now = new Date().toISOString();
      const task: Task = {
        id: crypto.randomUUID(), user_id: user!.id, goal_id: input.goal_id ?? null, title: input.title,
        kind: input.kind ?? 'task', done: false, due_date: input.due_date ?? null,
        created_at: now, updated_at: now, deleted_at: null,
      };
      await db.tasks.put(task);
      await enqueue(db, { table: 'tasks', op: 'upsert', recordId: task.id, payload: task as unknown as Record<string, unknown>, clientUpdatedAt: now });
      return task;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useToggleTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (task: Task) => {
      const now = new Date().toISOString();
      const updated: Task = { ...task, done: !task.done, updated_at: now };
      await db.tasks.put(updated);
      await enqueue(db, { table: 'tasks', op: 'upsert', recordId: updated.id, payload: updated as unknown as Record<string, unknown>, clientUpdatedAt: now });
      return updated;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });
}
