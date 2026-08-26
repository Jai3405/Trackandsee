'use client';
import { useTasks, useToggleTask } from '@/lib/hooks/useTasks';
import { EmptyState } from '@/components/ui/empty-state';
import { NotepadLine } from '@/components/ui/notepad-line';

export default function TodayPage() {
  const { data: tasks = [] } = useTasks();
  const toggleTask = useToggleTask();
  const today = tasks.filter((t) => !t.due_date || t.due_date === new Date().toISOString().slice(0, 10));

  return (
    <div className="p-4">
      <h1 className="mb-4 font-display text-2xl">Today</h1>
      {today.length === 0 && <EmptyState title="Nothing here yet" description="Add a task to get started." />}
      {today.length > 0 && (
        <div className="rounded-lg bg-notepad p-4">
          {today.map((t) => (
            <NotepadLine key={t.id} task={t} onToggle={(task) => toggleTask.mutate(task)} />
          ))}
        </div>
      )}
    </div>
  );
}
