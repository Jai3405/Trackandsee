'use client';
import { useState } from 'react';
import { useTasks, useToggleTask } from '@/lib/hooks/useTasks';
import { useGoals } from '@/lib/hooks/useGoals';
import { TaskRow } from '@/components/task-row';
import { EmptyState } from '@/components/ui/empty-state';

export default function TasksPage() {
  const { data: tasks = [] } = useTasks();
  const { data: goals = [] } = useGoals();
  const toggleTask = useToggleTask();
  const [goalFilter, setGoalFilter] = useState<'all' | 'none' | string>('all');

  const filtered = tasks.filter((t) => {
    if (goalFilter === 'all') return true;
    if (goalFilter === 'none') return !t.goal_id;
    return t.goal_id === goalFilter;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (!a.due_date && !b.due_date) return 0;
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return a.due_date.localeCompare(b.due_date);
  });

  const goalTitle = (goalId: string | null) => goals.find((g) => g.id === goalId)?.title;

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl">Tasks</h1>
        <label htmlFor="goal-filter" className="sr-only">Filter by goal</label>
        <select
          id="goal-filter"
          value={goalFilter}
          onChange={(e) => setGoalFilter(e.target.value)}
          className="rounded-lg border px-2 py-1 text-sm"
        >
          <option value="all">All goals</option>
          <option value="none">No goal</option>
          {goals.map((g) => <option key={g.id} value={g.id}>{g.title}</option>)}
        </select>
      </div>
      {sorted.length === 0 ? (
        <EmptyState title="No tasks" description="Nothing matches this filter yet." />
      ) : (
        <ul>
          {sorted.map((t) => (
            <TaskRow
              key={t.id}
              task={t}
              onToggle={(task) => toggleTask.mutate(task)}
              subtext={t.goal_id ? <p className="ml-6 text-xs text-ink/50">{goalTitle(t.goal_id)}</p> : undefined}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
