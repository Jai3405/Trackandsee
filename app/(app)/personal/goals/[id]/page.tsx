'use client';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useTasks, useCreateTask, useToggleTask } from '@/lib/hooks/useTasks';
import { useGoals } from '@/lib/hooks/useGoals';
import { goalProgress } from '@/lib/goal-progress';
import type { Task } from '@/lib/db/types';

function TaskRow({ task, onToggle }: { task: Task; onToggle: (task: Task) => void }) {
  // Local override so the click is reflected the instant it happens, instead of
  // waiting on the mutation's pending-state re-render (which briefly re-applies the
  // stale `task.done` before the optimistic cache update lands a tick later). Reset
  // during render (React's documented pattern for this) whenever the server-backed
  // value catches up, so a realtime update from another device still wins.
  const [lastSeenDone, setLastSeenDone] = useState(task.done);
  const [override, setOverride] = useState<boolean | null>(null);
  if (task.done !== lastSeenDone) {
    setLastSeenDone(task.done);
    setOverride(null);
  }
  const done = override ?? task.done;

  return (
    <li className="mb-2 flex items-center gap-2">
      <input type="checkbox" id={`task-${task.id}`} checked={done}
        onChange={() => { setOverride(!done); onToggle(task); }} />
      <label htmlFor={`task-${task.id}`}>{task.title}</label>
    </li>
  );
}

export default function GoalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: goals = [] } = useGoals();
  const { data: tasks = [] } = useTasks(id);
  const createTask = useCreateTask();
  const toggleTask = useToggleTask();
  const [title, setTitle] = useState('');

  const goal = goals.find((g) => g.id === id);
  const { done, total } = goalProgress(tasks);

  return (
    <div className="p-4">
      <h1 className="mb-1 font-display text-2xl">{goal?.title}</h1>
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
        <button type="submit" className="rounded-lg bg-brass px-4 py-2">Add action item</button>
      </form>
    </div>
  );
}
