'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useGoals, useCreateGoal } from '@/lib/hooks/useGoals';
import { useTasks } from '@/lib/hooks/useTasks';
import { PinnedCard } from '@/components/ui/pinned-card';
import { EmptyState } from '@/components/ui/empty-state';
import { goalProgress } from '@/lib/goal-progress';
import type { Task } from '@/lib/db/types';

function GoalCard({ id, title, tasks }: { id: string; title: string; tasks: Task[] }) {
  const { done, total } = goalProgress(tasks.filter((t) => t.goal_id === id));
  const pips = Array.from({ length: total }, (_, i) => i < done);

  return (
    <Link href={`/personal/goals/${id}`}>
      <PinnedCard id={id} size="sm" className="w-44">
        <h4 className="mb-2 font-display text-sm">{title}</h4>
        {total > 0 && (
          <div className="mb-1 flex gap-1">
            {pips.map((isDone, i) => (
              <span key={i} className={`h-2 w-2 rounded-full ${isDone ? 'bg-sage' : 'bg-ink/15'}`} />
            ))}
          </div>
        )}
        <p className="text-[0.65rem] text-ink/60">{done} of {total} done</p>
      </PinnedCard>
    </Link>
  );
}

export default function GoalsPage() {
  const { data: goals = [] } = useGoals();
  const { data: tasks = [] } = useTasks();
  const createGoal = useCreateGoal();
  const [title, setTitle] = useState('');
  const [showClosed, setShowClosed] = useState(false);

  const visible = goals.filter((g) => (showClosed ? g.status === 'closed' : g.status === 'open'));

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl">Goals</h1>
        <div className="flex gap-3 text-sm">
          <button onClick={() => setShowClosed(false)} aria-pressed={showClosed === false} className={!showClosed ? 'font-bold text-ink' : 'text-ink/60'}>Active board</button>
          <button onClick={() => setShowClosed(true)} aria-pressed={showClosed === true} className={showClosed ? 'font-bold text-ink' : 'text-ink/60'}>Archive</button>
        </div>
      </div>

      <div className="rounded-lg bg-ink p-5">
        {visible.length === 0 && (
          <EmptyState
            title={showClosed ? 'No closed goals' : 'No goals yet'}
            description={showClosed ? 'Goals you close will show up here.' : 'Set your first goal to start tracking progress.'}
          />
        )}
        <div className="flex flex-wrap gap-4">
          {visible.map((g) => <GoalCard key={g.id} id={g.id} title={g.title} tasks={tasks} />)}
        </div>
      </div>

      {!showClosed && (
        <form
          className="mt-4 flex gap-2"
          onSubmit={(e) => { e.preventDefault(); if (title.trim()) { createGoal.mutate({ title }); setTitle(''); } }}
        >
          <label htmlFor="new-goal-title" className="sr-only">Title</label>
          <input id="new-goal-title" value={title} onChange={(e) => setTitle(e.target.value)}
            className="flex-1 rounded-lg border px-3 py-2" placeholder="New goal title" />
          <button type="submit" className="rounded-lg bg-accent px-4 py-2 text-parchment">New goal</button>
        </form>
      )}
    </div>
  );
}
