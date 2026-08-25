'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useGoals, useCreateGoal } from '@/lib/hooks/useGoals';
import { useTasks } from '@/lib/hooks/useTasks';
import { FrameCard } from '@/components/ui/frame-card';
import { EmptyState } from '@/components/ui/empty-state';
import { goalProgress } from '@/lib/goal-progress';

function GoalRow({ id, title }: { id: string; title: string }) {
  const { data: tasks = [] } = useTasks(id);
  const { done, total } = goalProgress(tasks);
  return (
    <Link href={`/personal/goals/${id}`}>
      <FrameCard className="mb-3 p-4">
        <p className="font-display text-lg">{title}</p>
        <p className="text-sm text-ink/60">{done} of {total}</p>
      </FrameCard>
    </Link>
  );
}

export default function GoalsPage() {
  const { data: goals = [] } = useGoals();
  const createGoal = useCreateGoal();
  const [title, setTitle] = useState('');
  const [showClosed, setShowClosed] = useState(false);

  const visible = goals.filter((g) => (showClosed ? g.status === 'closed' : g.status === 'open'));

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl">Goals</h1>
        <div className="flex gap-3 text-sm">
          <button onClick={() => setShowClosed(false)} aria-pressed={showClosed === false} className={!showClosed ? 'font-bold text-ink' : 'text-ink/60'}>Open</button>
          <button onClick={() => setShowClosed(true)} aria-pressed={showClosed === true} className={showClosed ? 'font-bold text-ink' : 'text-ink/60'}>Closed</button>
        </div>
      </div>
      {visible.length === 0 && (
        <EmptyState
          title={showClosed ? 'No closed goals' : 'No goals yet'}
          description={showClosed ? 'Goals you close will show up here.' : 'Set your first goal to start tracking progress.'}
        />
      )}
      {visible.map((g) => <GoalRow key={g.id} id={g.id} title={g.title} />)}
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
