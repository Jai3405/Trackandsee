'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '../db/schema';
import { enqueue } from '../sync/outbox';
import { useSession } from '../auth/session';
import type { Goal } from '../db/types';

export function useGoals() {
  return useQuery({
    queryKey: ['goals'],
    queryFn: async () => (await db.goals.toArray()).filter((g) => !g.deleted_at),
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  const { user } = useSession();
  return useMutation({
    mutationFn: async (input: { title: string; target_date?: string }) => {
      const now = new Date().toISOString();
      const goal: Goal = {
        id: crypto.randomUUID(), user_id: user!.id, title: input.title,
        target_date: input.target_date ?? null, status: 'open',
        created_at: now, updated_at: now, deleted_at: null,
      };
      await db.goals.put(goal);
      await enqueue(db, { table: 'goals', op: 'upsert', recordId: goal.id, payload: goal as unknown as Record<string, unknown>, clientUpdatedAt: now });
      return goal;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] }),
  });
}

export function useSetGoalStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; status: 'open' | 'closed' }) => {
      const existing = await db.goals.get(input.id);
      if (!existing) throw new Error('goal not found');
      const now = new Date().toISOString();
      const updated: Goal = { ...existing, status: input.status, updated_at: now };
      await db.goals.put(updated);
      await enqueue(db, { table: 'goals', op: 'upsert', recordId: updated.id, payload: updated as unknown as Record<string, unknown>, clientUpdatedAt: now });
      return updated;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] }),
  });
}
