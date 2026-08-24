'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '../db/schema';
import { enqueue } from '../sync/outbox';
import { useSession } from '../auth/session';
import type { Expense } from '../db/types';

export function useExpenses() {
  return useQuery({
    queryKey: ['expenses'],
    queryFn: async () => (await db.expenses.toArray()).filter((e) => !e.deleted_at),
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  const { user } = useSession();
  return useMutation({
    mutationFn: async (input: { date: string; amount: number; kind: 'expense' | 'investment'; description?: string }) => {
      const now = new Date().toISOString();
      const expense: Expense = {
        id: crypto.randomUUID(), user_id: user!.id, date: input.date, amount: input.amount,
        kind: input.kind, current_value: null, description: input.description ?? null,
        created_at: now, updated_at: now, deleted_at: null,
      };
      await db.expenses.put(expense);
      await enqueue(db, { table: 'expenses', op: 'upsert', recordId: expense.id, payload: expense as unknown as Record<string, unknown>, clientUpdatedAt: now });
      return expense;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenses'] }),
  });
}
