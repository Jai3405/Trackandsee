'use client';
import { useState } from 'react';
import type { Task } from '@/lib/db/types';

export function TaskRow({ task, onToggle }: { task: Task; onToggle: (task: Task) => void }) {
  // Local override so the click is reflected the instant it happens, instead of
  // waiting on the mutation's pending-state re-render (which briefly re-applies the
  // stale `task.done` before the optimistic cache update lands a tick later). Reset
  // during render (React's documented pattern for this) whenever the server-backed
  // value catches up, so a realtime update from another device still wins.
  //
  // Isolation-tested: with only the `onMutate` optimistic cache update (no local
  // override), `create a goal, add an action item, complete it` fails 3/3 runs with
  // "locator.check: Clicking the checkbox did not change its state" — see task-10
  // fix report. This component is required, not precautionary.
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
