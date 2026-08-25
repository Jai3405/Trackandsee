'use client';
import { useState } from 'react';
import { useTasks, useToggleTask } from '@/lib/hooks/useTasks';
import { useGoals } from '@/lib/hooks/useGoals';
import { NotepadLine } from '@/components/ui/notepad-line';
import { EmptyState } from '@/components/ui/empty-state';
import type { Task } from '@/lib/db/types';

// Sunday-start week, matching lib/calendar-grid.ts's monthGrid() convention, so
// Tasks and Calendar never disagree about what "this week" means.
function endOfWeek(from: Date): Date {
  const d = new Date(from);
  d.setDate(d.getDate() + (6 - d.getDay()));
  d.setHours(23, 59, 59, 999);
  return d;
}

function bucketTasks(tasks: Task[]): { today: Task[]; thisWeek: Task[]; later: Task[]; noDate: Task[] } {
  const todayStr = new Date().toISOString().slice(0, 10);
  const weekEndStr = endOfWeek(new Date()).toISOString().slice(0, 10);
  const today: Task[] = [];
  const thisWeek: Task[] = [];
  const later: Task[] = [];
  const noDate: Task[] = [];
  for (const t of tasks) {
    if (!t.due_date) noDate.push(t);
    else if (t.due_date === todayStr) today.push(t);
    else if (t.due_date > todayStr && t.due_date <= weekEndStr) thisWeek.push(t);
    else later.push(t);
  }
  return { today, thisWeek, later, noDate };
}

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
    if (!a.due_date && !b.due_date) return a.title.localeCompare(b.title);
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return a.due_date.localeCompare(b.due_date) || a.title.localeCompare(b.title);
  });

  const goalTitle = (goalId: string | null) => goals.find((g) => g.id === goalId)?.title;
  const buckets = bucketTasks(sorted);
  const sections: [string, Task[]][] = [
    ['Today', buckets.today],
    ['This week', buckets.thisWeek],
    ['Later', buckets.later],
    ['No date', buckets.noDate],
  ];

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
        <div
          className="rounded-lg bg-paper p-4"
          style={{ backgroundImage: 'repeating-linear-gradient(180deg, transparent 0 27px, rgba(17,41,75,.08) 27px 28px)' }}
        >
          {sections.map(([label, items]) => items.length > 0 && (
            <div key={label} className="mb-1">
              <p className="mb-1 mt-3 text-[0.65rem] font-semibold uppercase tracking-wide text-ink/55 first:mt-0">{label}</p>
              {items.map((t) => (
                <NotepadLine
                  key={t.id}
                  task={t}
                  onToggle={(task) => toggleTask.mutate(task)}
                  goalLabel={t.goal_id ? goalTitle(t.goal_id) : undefined}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
