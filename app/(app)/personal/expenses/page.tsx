'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useExpenses, useCreateExpense, useUpdateExpense, useDeleteExpense } from '@/lib/hooks/useExpenses';
import { usePendingTransactions } from '@/lib/hooks/usePendingTransactions';
import { FrameCard } from '@/components/ui/frame-card';
import { AnimatedNumber } from '@/components/ui/animated-number';
import type { Expense } from '@/lib/db/types';

export default function ExpensesPage() {
  const { data: expenses = [] } = useExpenses();
  const { data: pending = [] } = usePendingTransactions();
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const deleteExpense = useDeleteExpense();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const plainExpenses = expenses.filter((e) => e.kind === 'expense');
  const investments = expenses.filter((e) => e.kind === 'investment');
  const total = plainExpenses.reduce((sum, e) => sum + e.amount, 0);

  function handleDelete(id: string) {
    if (window.confirm('Delete this entry? This cannot be undone.')) {
      deleteExpense.mutate(id);
    }
  }

  return (
    <div className="p-4">
      <h1 className="mb-4 font-display text-2xl">Expenses</h1>

      {deleteExpense.isError && <p className="mb-4 text-sm text-rust">Couldn&apos;t delete — try again.</p>}

      {pending.length > 0 && (
        <Link href="/personal/transactions" className="mb-4 block rounded-lg bg-accent/10 p-3 text-sm text-accent underline underline-offset-2">
          {pending.length} transaction{pending.length === 1 ? '' : 's'} from Gmail need review
        </Link>
      )}

      <section className="mb-6">
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="font-display text-lg">Expenses</h2>
          <p className="font-display text-xl"><AnimatedNumber value={total} /></p>
        </div>
        {plainExpenses.map((e) => (
          <ExpenseRow
            key={e.id}
            expense={e}
            editing={editingId === e.id}
            onEdit={() => setEditingId(e.id)}
            onCancel={() => setEditingId(null)}
            onSave={async (fields) => { await updateExpense.mutateAsync({ id: e.id, ...fields }); setEditingId(null); }}
            onDelete={() => handleDelete(e.id)}
            saveError={updateExpense.isError && updateExpense.variables?.id === e.id}
          />
        ))}
        <form
          className="mt-3 flex flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (newDate && newAmount) {
              createExpense.mutate({ date: newDate, amount: Number(newAmount), kind: 'expense', description: newDescription });
              setNewDate(''); setNewAmount(''); setNewDescription('');
            }
          }}
        >
          <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="rounded-lg border px-3 py-2" required />
          <input type="number" step="0.01" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} placeholder="Amount" className="rounded-lg border px-3 py-2" required />
          <input value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Description" className="flex-1 rounded-lg border px-3 py-2" />
          <button type="submit" className="rounded-lg bg-accent px-4 py-2 text-parchment">Add expense</button>
        </form>
      </section>

      <section>
        <h2 className="mb-2 font-display text-lg">Investments</h2>
        {investments.map((e) => (
          <InvestmentRow
            key={e.id}
            expense={e}
            editing={editingId === e.id}
            onEdit={() => setEditingId(e.id)}
            onCancel={() => setEditingId(null)}
            onSave={async (fields) => { await updateExpense.mutateAsync({ id: e.id, ...fields }); setEditingId(null); }}
            onDelete={() => handleDelete(e.id)}
            saveError={updateExpense.isError && updateExpense.variables?.id === e.id}
          />
        ))}
      </section>
    </div>
  );
}

function ExpenseRow({
  expense, editing, onEdit, onCancel, onSave, onDelete, saveError,
}: {
  expense: Expense;
  editing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (fields: { date: string; amount: number; description: string }) => void;
  onDelete: () => void;
  saveError: boolean;
}) {
  const [date, setDate] = useState(expense.date);
  const [amount, setAmount] = useState(expense.amount.toString());
  const [description, setDescription] = useState(expense.description ?? '');

  function startEdit() {
    setDate(expense.date);
    setAmount(expense.amount.toString());
    setDescription(expense.description ?? '');
    onEdit();
  }

  if (!editing) {
    return (
      <FrameCard className="mb-2 flex items-center justify-between p-3">
        <button onClick={startEdit} className="text-left">
          <p>{expense.description || '(no description)'}</p>
          <p className="text-sm text-ink/60">{expense.date} — {expense.amount.toFixed(2)}</p>
        </button>
        <button onClick={onDelete} className="text-sm text-rust">Delete</button>
      </FrameCard>
    );
  }

  return (
    <FrameCard className="mb-2 p-3">
      {saveError && <p className="mb-2 text-sm text-rust">Couldn&apos;t save — try again.</p>}
      <div className="flex flex-wrap gap-2">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-lg border px-2 py-1" />
        <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-24 rounded-lg border px-2 py-1" />
        <input value={description} onChange={(e) => setDescription(e.target.value)} className="flex-1 rounded-lg border px-2 py-1" />
        <button onClick={() => onSave({ date, amount: Number(amount), description })} className="rounded-lg bg-accent px-3 py-1 text-sm text-parchment">Save</button>
        <button onClick={onCancel} className="rounded-lg border px-3 py-1 text-sm">Cancel</button>
      </div>
    </FrameCard>
  );
}

function InvestmentRow({
  expense, editing, onEdit, onCancel, onSave, onDelete, saveError,
}: {
  expense: Expense;
  editing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (fields: { current_value: number | null }) => void;
  onDelete: () => void;
  saveError: boolean;
}) {
  const [currentValue, setCurrentValue] = useState(expense.current_value?.toString() ?? '');
  const delta = expense.current_value != null ? expense.current_value - expense.amount : null;

  function startEdit() {
    setCurrentValue(expense.current_value?.toString() ?? '');
    onEdit();
  }

  if (!editing) {
    return (
      <FrameCard className="mb-2 flex items-center justify-between p-3">
        <button onClick={startEdit} className="text-left">
          <p>{expense.description || '(no description)'}</p>
          <p className="text-sm text-ink/60">
            Invested {expense.amount.toFixed(2)}
            {expense.current_value != null && ` — now ${expense.current_value.toFixed(2)}`}
            {delta != null && (
              <span className={delta >= 0 ? 'text-sage' : 'text-rust'}> ({delta >= 0 ? '+' : ''}{delta.toFixed(2)})</span>
            )}
          </p>
        </button>
        <button onClick={onDelete} className="text-sm text-rust">Delete</button>
      </FrameCard>
    );
  }

  return (
    <FrameCard className="mb-2 p-3">
      {saveError && <p className="mb-2 text-sm text-rust">Couldn&apos;t save — try again.</p>}
      <div className="flex gap-2">
        <label htmlFor={`current-value-${expense.id}`} className="text-sm text-ink/60">Current value</label>
        <input
          id={`current-value-${expense.id}`}
          type="number"
          step="0.01"
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          className="w-24 rounded-lg border px-2 py-1"
        />
        <button onClick={() => onSave({ current_value: currentValue === '' ? null : Number(currentValue) })} className="rounded-lg bg-accent px-3 py-1 text-sm text-parchment">Save</button>
        <button onClick={onCancel} className="rounded-lg border px-3 py-1 text-sm">Cancel</button>
      </div>
    </FrameCard>
  );
}
