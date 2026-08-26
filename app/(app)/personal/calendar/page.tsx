'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { useTasks } from '@/lib/hooks/useTasks';
import { monthGrid } from '@/lib/calendar-grid';
import { PinnedCard } from '@/components/ui/pinned-card';

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarPage() {
  const { data: tasks = [] } = useTasks();
  const now = new Date();
  const [year, setYear] = useState(now.getUTCFullYear());
  const [month, setMonth] = useState(now.getUTCMonth());

  const grid = monthGrid(year, month);
  const monthKey = `${year}-${month}`;
  const monthLabel = new Date(Date.UTC(year, month, 1)).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  const todayStr = now.toISOString().slice(0, 10);

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

      <div className="rounded-lg bg-ink p-4">
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-parchment-dim">
          {WEEKDAY_LABELS.map((w) => <div key={w}>{w}</div>)}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={monthKey}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
            className="mt-1 grid grid-cols-7 gap-1"
          >
            {grid.map((day) => {
              const items = tasksByDay(day.date);
              const isToday = day.date === todayStr;
              return (
                <Link
                  key={day.date}
                  href={`/personal/calendar/${day.date}`}
                  className={`relative flex min-h-20 flex-col items-center rounded p-1 ${day.inCurrentMonth ? '' : 'opacity-35'} ${isToday ? 'ring-2 ring-rust' : ''}`}
                >
                  <span className="self-start text-[0.65rem] text-parchment-dim">{Number(day.date.slice(8, 10))}</span>
                  {items.length === 1 && (
                    <PinnedCard id={items[0].id} size="sm" className="mt-2 w-14 text-center text-[0.5rem]">
                      <span className="line-clamp-2">{items[0].title}</span>
                    </PinnedCard>
                  )}
                  {items.length > 1 && (
                    <div className="relative mt-2 h-9 w-14">
                      {items.slice(0, 3).map((t, i) => (
                        <div
                          key={t.id}
                          className="absolute left-0 top-0"
                          style={{ transform: `translate(${i * 4}px, ${i * 6}px)`, zIndex: 3 - i, opacity: 1 - i * 0.12 }}
                        >
                          <PinnedCard id={t.id} size="sm" className="w-14 text-center text-[0.5rem]">
                            <span className="line-clamp-1">{t.title}</span>
                          </PinnedCard>
                        </div>
                      ))}
                      <span className="absolute -bottom-1 -right-1 z-10 rounded-full bg-ink px-1 text-[0.5rem] text-parchment" style={{ border: '1px solid #BFB2A1' }}>
                        {items.length}
                      </span>
                    </div>
                  )}
                </Link>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
