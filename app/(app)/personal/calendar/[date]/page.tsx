'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useTasks, useCreateTask, useToggleTask } from '@/lib/hooks/useTasks';
import { useGoals } from '@/lib/hooks/useGoals';
import { PinnedCard } from '@/components/ui/pinned-card';
import { NotepadLine } from '@/components/ui/notepad-line';

export default function CalendarDayPage() {
  const { date } = useParams<{ date: string }>();
  const { data: tasks = [] } = useTasks();
  const { data: goals = [] } = useGoals();
  const createTask = useCreateTask();
  const toggleTask = useToggleTask();
  const [title, setTitle] = useState('');

  const dayItems = tasks.filter((t) => t.due_date === date);
  const events = dayItems.filter((t) => t.kind === 'event');
  const dueTasks = dayItems.filter((t) => t.kind === 'task');
  const goalTitle = (goalId: string | null) => goals.find((g) => g.id === goalId)?.title;

  const dateObj = new Date(`${date}T00:00:00Z`);
  const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
  const monthDay = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' });
  const monthHref = `/personal/calendar?m=${date.slice(0, 7)}`;
  const monthLabel = dateObj.toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' });

  return (
    <div className="p-4">
      <Link href={monthHref} className="mb-2 inline-block text-sm text-accent underline underline-offset-2">&larr; Back to {monthLabel}</Link>

      <div className="rounded-lg bg-ink p-6 sm:p-10">
        <div className="mb-8 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs uppercase tracking-wide text-dusty-blue">{weekday}</p>
            <h1 className="font-display text-3xl text-parchment">{monthDay}</h1>
          </div>
          <p className="text-sm text-parchment-dim">
            {events.length} event{events.length === 1 ? '' : 's'} · {dueTasks.length} task{dueTasks.length === 1 ? '' : 's'} due
          </p>
        </div>

        {createTask.isError && <p className="mb-4 text-sm text-rust">Couldn&apos;t add — try again.</p>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {events.map((t) => (
            <PinnedCard key={t.id} id={t.id} size="lg" kindLabel="Event">
              <h4 className="font-display text-lg">{t.title}</h4>
            </PinnedCard>
          ))}

          {dueTasks.map((t) => (
            <PinnedCard key={t.id} id={t.id} size="lg" kindLabel="Task">
              <NotepadLine task={t} onToggle={(task) => toggleTask.mutate(task)} goalLabel={t.goal_id ? goalTitle(t.goal_id) : undefined} />
            </PinnedCard>
          ))}

          <form
            className="flex min-h-32 flex-col justify-center gap-2 rounded-lg border-2 border-dashed border-parchment/30 p-5"
            onSubmit={async (e) => {
              e.preventDefault();
              if (title.trim()) {
                try {
                  await createTask.mutateAsync({ title, due_date: date, kind: 'event' });
                  setTitle('');
                } catch {
                  // createTask.isError renders above
                }
              }
            }}
          >
            <label htmlFor="new-event-title" className="sr-only">Title</label>
            <input
              id="new-event-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm"
              placeholder={`Add to ${monthDay}`}
            />
            <button type="submit" className="rounded-lg bg-accent px-4 py-2 text-sm text-parchment">Add</button>
          </form>
        </div>
      </div>
    </div>
  );
}
