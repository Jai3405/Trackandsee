'use client';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useTasks, useCreateTask, useToggleTask } from '@/lib/hooks/useTasks';
import { useGoals } from '@/lib/hooks/useGoals';
import { goalProgress } from '@/lib/goal-progress';
import { TaskRow } from '@/components/task-row';

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
