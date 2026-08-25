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
    mutationFn: async (input: { id?: string; date: string; amount: number; kind: 'expense' | 'investment'; description?: string }) => {
      const now = new Date().toISOString();
      const expense: Expense = {
        id: input.id ?? crypto.randomUUID(), user_id: user!.id, date: input.date, amount: input.amount,
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

export function useUpdateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; date?: string; amount?: number; kind?: 'expense' | 'investment'; description?: string; current_value?: number | null }) => {
      const existing = await db.expenses.get(input.id);
      if (!existing) throw new Error('expense not found');
      const now = new Date().toISOString();
      const updated: Expense = { ...existing, ...input, updated_at: now };
      await db.expenses.put(updated);
      await enqueue(db, { table: 'expenses', op: 'upsert', recordId: updated.id, payload: updated as unknown as Record<string, unknown>, clientUpdatedAt: now });
      return updated;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenses'] }),
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const existing = await db.expenses.get(id);
      if (!existing) return;
      const now = new Date().toISOString();
      await db.expenses.put({ ...existing, deleted_at: now, updated_at: now });
      await enqueue(db, { table: 'expenses', op: 'delete', recordId: id, payload: null, clientUpdatedAt: now });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenses'] }),
  });
}
