'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';

export function WorkspaceSwitcher() {
  const pathname = usePathname();
  const active = pathname.startsWith('/org') ? 'org' : 'personal';

  return (
    <nav className="flex gap-1 rounded-lg bg-indigo-700 p-1">
      <Link href="/personal/today" className="relative rounded px-3 py-1 text-sm">
        {active === 'personal' && (
          <motion.span
            layoutId="workspace-active-pill"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="absolute inset-0 rounded bg-accent"
          />
        )}
        <span className={`relative ${active === 'personal' ? 'text-ink' : 'text-parchment'}`}>Personal</span>
      </Link>
      <span
        aria-disabled="true"
        title="Org workspace is not available yet"
        className="cursor-not-allowed rounded px-3 py-1 text-sm text-parchment/40">
        Org
      </span>
    </nav>
  );
}
