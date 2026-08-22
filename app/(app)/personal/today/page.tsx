'use client';
import { useTasks, useToggleTask } from '@/lib/hooks/useTasks';
import { EmptyState } from '@/components/ui/empty-state';

export default function TodayPage() {
  const { data: tasks = [] } = useTasks();
  const toggleTask = useToggleTask();
  const today = tasks.filter((t) => !t.due_date || t.due_date === new Date().toISOString().slice(0, 10));

  return (
    <div className="p-4">
      <h1 className="mb-4 font-display text-2xl">Today</h1>
      {today.length === 0 && <EmptyState title="Nothing here yet" description="Add a task to get started." />}
      <ul>
        {today.map((t) => (
          <li key={t.id} className="mb-2 flex items-center gap-2">
            <input type="checkbox" id={`today-${t.id}`} checked={t.done} onChange={() => toggleTask.mutate(t)} />
            <label htmlFor={`today-${t.id}`}>{t.title}</label>
          </li>
        ))}
      </ul>
    </div>
  );
}
