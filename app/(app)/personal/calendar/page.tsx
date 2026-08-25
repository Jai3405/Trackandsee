'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTasks, useCreateTask } from '@/lib/hooks/useTasks';
import { monthGrid } from '@/lib/calendar-grid';

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarPage() {
  const { data: tasks = [] } = useTasks();
  const createTask = useCreateTask();
  const now = new Date();
  const [year, setYear] = useState(now.getUTCFullYear());
  const [month, setMonth] = useState(now.getUTCMonth());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [title, setTitle] = useState('');

  const grid = monthGrid(year, month);
  const monthKey = `${year}-${month}`;
  const monthLabel = new Date(Date.UTC(year, month, 1)).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });

  function goToMonth(delta: number) {
    const d = new Date(Date.UTC(year, month + delta, 1));
    setYear(d.getUTCFullYear());
    setMonth(d.getUTCMonth());
  }

  function goToToday() {
    setYear(now.getUTCFullYear());
    setMonth(now.getUTCMonth());
  }

  const tasksByDay = (date: string) => tasks.filter((t) => t.due_date === date);

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl">{monthLabel}</h1>
        <div className="flex gap-2 text-sm">
          <button onClick={() => goToMonth(-1)} className="rounded border px-2 py-1">Prev</button>
          <button onClick={goToToday} className="rounded border px-2 py-1">Today</button>
          <button onClick={() => goToMonth(1)} className="rounded border px-2 py-1">Next</button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-ink/60">
        {WEEKDAY_LABELS.map((w) => <div key={w}>{w}</div>)}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={monthKey}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-7 gap-1"
        >
          {grid.map((day) => (
            <button
              key={day.date}
              onClick={() => setSelectedDay(day.date)}
              className={`min-h-16 rounded border p-1 text-left text-xs ${day.inCurrentMonth ? 'bg-parchment' : 'bg-parchment-dim text-ink/40'} ${selectedDay === day.date ? 'ring-2 ring-accent' : ''}`}
            >
              <div>{Number(day.date.slice(8, 10))}</div>
              {tasksByDay(day.date).map((t) => (
                <div key={t.id} className="truncate">{t.title}</div>
              ))}
            </button>
          ))}
        </motion.div>
      </AnimatePresence>

      {selectedDay && createTask.isError && <p className="mt-4 text-sm text-rust">Couldn&apos;t add — try again.</p>}
      {selectedDay && (
        <form
          className="mt-4 flex gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            if (title.trim()) {
              try {
                await createTask.mutateAsync({ title, due_date: selectedDay, kind: 'event' });
                setTitle('');
              } catch {
                // createTask.isError renders the message below
              }
            }
          }}
        >
          <label htmlFor="new-event-title" className="sr-only">Title</label>
          <input
            id="new-event-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 rounded-lg border px-3 py-2"
            placeholder={`Add to ${selectedDay}`}
          />
          <button type="submit" className="rounded-lg bg-accent px-4 py-2 text-parchment">Add</button>
        </form>
      )}
    </div>
  );
}
