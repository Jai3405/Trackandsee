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

  return (
    <div className="p-4">
      <h1 className="mb-4 font-display text-2xl">Goals</h1>
      {goals.length === 0 && (
        <EmptyState title="No goals yet" description="Set your first goal to start tracking progress." />
      )}
      {goals.map((g) => <GoalRow key={g.id} id={g.id} title={g.title} />)}
      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => { e.preventDefault(); if (title.trim()) { createGoal.mutate({ title }); setTitle(''); } }}
      >
        <label htmlFor="new-goal-title" className="sr-only">Title</label>
        <input id="new-goal-title" value={title} onChange={(e) => setTitle(e.target.value)}
          className="flex-1 rounded-lg border px-3 py-2" placeholder="New goal title" />
        <button type="submit" className="rounded-lg bg-brass px-4 py-2">New goal</button>
      </form>
    </div>
  );
}
