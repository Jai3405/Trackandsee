'use client';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useTasks, useCreateTask, useToggleTask } from '@/lib/hooks/useTasks';
import { useGoals, useSetGoalStatus } from '@/lib/hooks/useGoals';
import { goalProgress } from '@/lib/goal-progress';
import { TaskRow } from '@/components/task-row';

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
      <div className="mb-1 flex items-center justify-between">
        <h1 className="font-display text-2xl">{goal?.title}</h1>
        {goal && (
          <button
            onClick={() => setGoalStatus.mutate({ id: goal.id, status: goal.status === 'open' ? 'closed' : 'open' })}
            className="rounded-lg border px-3 py-1 text-sm"
          >
            {goal.status === 'open' ? 'Close goal' : 'Reopen goal'}
          </button>
        )}
      </div>
      {setGoalStatus.isError && <p className="mb-2 text-sm text-rust">Couldn&apos;t update goal status — try again.</p>}
      <p className="mb-4 text-sm text-ink/60">{done} of {total}</p>
      <ul>
        {tasks.map((t) => (
          <TaskRow key={t.id} task={t} onToggle={(task) => toggleTask.mutate(task)} />
        ))}
      </ul>
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
