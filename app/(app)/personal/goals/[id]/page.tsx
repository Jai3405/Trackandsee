// app/(app)/personal/goals/[id]/page.tsx
'use client';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useTasks, useCreateTask, useToggleTask } from '@/lib/hooks/useTasks';
import { useGoals, useSetGoalStatus } from '@/lib/hooks/useGoals';
import { goalProgress } from '@/lib/goal-progress';
import { PinnedCard } from '@/components/ui/pinned-card';
import { NotepadLine } from '@/components/ui/notepad-line';

export default function GoalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: goals = [] } = useGoals();
  const { data: tasks = [] } = useTasks(id);
  const createTask = useCreateTask();
  const toggleTask = useToggleTask();
  const setGoalStatus = useSetGoalStatus();
  const [title, setTitle] = useState('');

  const goal = goals.find((g) => g.id === id);
  const { done, total } = goalProgress(tasks);

  return (
    <div className="p-4">
      {goal && (
        <PinnedCard id={goal.id} size="lg" className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-2xl">{goal.title}</h1>
            <button
              onClick={() => setGoalStatus.mutate({ id: goal.id, status: goal.status === 'open' ? 'closed' : 'open' })}
              className="rounded-lg border border-ink/30 px-3 py-1 text-sm"
            >
              {goal.status === 'open' ? 'Close goal' : 'Reopen goal'}
            </button>
          </div>
          {setGoalStatus.isError && <p className="mt-2 text-sm text-rust">Couldn&apos;t update goal status — try again.</p>}
          <p className="mt-2 text-sm text-ink/60">{done} of {total} done</p>
        </PinnedCard>
      )}

      <div className="rounded-lg bg-notepad p-4">
        {tasks.map((t) => (
          <NotepadLine key={t.id} task={t} onToggle={(task) => toggleTask.mutate(task)} />
        ))}
      </div>

      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => { e.preventDefault(); if (title.trim()) { createTask.mutate({ title, goal_id: id }); setTitle(''); } }}
      >
        <label htmlFor="new-task-title" className="sr-only">Title</label>
        <input id="new-task-title" value={title} onChange={(e) => setTitle(e.target.value)}
          className="flex-1 rounded-lg border px-3 py-2" placeholder="Action item title" />
        <button type="submit" className="rounded-lg bg-accent px-4 py-2 text-parchment">Add action item</button>
      </form>
    </div>
  );
}
