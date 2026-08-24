'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useCreateExpense } from './useExpenses';

export interface PendingTransaction {
  id: string;
  amount: number | null;
  merchant: string | null;
  category_guess: string | null;
  occurred_at: string;
  raw_snippet: string | null;
  status: 'pending' | 'approved' | 'discarded';
}

export function usePendingTransactions() {
  return useQuery({
    queryKey: ['pending-transactions'],
    queryFn: async () => {
      const { data, error } = await getSupabaseClient()
        .from('pending_transactions')
        .select('*')
        .eq('status', 'pending')
        .order('occurred_at', { ascending: false });
      if (error) throw error;
      return data as PendingTransaction[];
    },
  });
}

export function useDiscardPendingTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await getSupabaseClient().from('pending_transactions').update({ status: 'discarded' }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pending-transactions'] }),
  });
}

export function useApprovePendingTransaction() {
  const queryClient = useQueryClient();
  const createExpense = useCreateExpense();
  return useMutation({
    mutationFn: async (input: { id: string; amount: number; description: string; date: string }) => {
      await createExpense.mutateAsync({ id: input.id, date: input.date, amount: input.amount, kind: 'expense', description: input.description });
      const { error } = await getSupabaseClient().from('pending_transactions').update({ status: 'approved' }).eq('id', input.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pending-transactions'] }),
  });
}
