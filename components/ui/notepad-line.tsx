'use client';
import { useState } from 'react';
import type { Task } from '@/lib/db/types';

export function NotepadLine({
  task,
  onToggle,
  goalLabel,
}: {
  task: Task;
  onToggle: (task: Task) => void;
  goalLabel?: string;
}) {
  // Local override so the click is reflected the instant it happens, instead of
  // waiting on the mutation's pending-state re-render (which briefly re-applies the
  // stale `task.done` before the optimistic cache update lands a tick later). Reset
  // during render whenever the server-backed value catches up, so a realtime update
  // from another device still wins. This carries over verbatim from the original
  // components/task-row.tsx (now deleted) — isolation-tested there: without this
  // override, "create a goal, add an action item, complete it" failed 3/3 Playwright
  // runs with "locator.check: Clicking the checkbox did not change its state."
  const [lastSeenDone, setLastSeenDone] = useState(task.done);
  const [override, setOverride] = useState<boolean | null>(null);
  if (task.done !== lastSeenDone) {
    setLastSeenDone(task.done);
    setOverride(null);
  }
  const done = override ?? task.done;

  return (
    <div className="flex items-center gap-3 border-b border-ink/10 py-1.5 text-sm text-ink last:border-b-0">
      <input
        type="checkbox"
        id={`notepad-task-${task.id}`}
        checked={done}
        onChange={() => { setOverride(!done); onToggle(task); }}
        className="h-3.5 w-3.5 flex-shrink-0 rounded border-ink"
      />
      <label htmlFor={`notepad-task-${task.id}`} className={done ? 'line-through opacity-50' : ''}>{task.title}</label>
      {goalLabel && <span className="ml-auto text-xs text-accent">{goalLabel}</span>}
    </div>
  );
}
