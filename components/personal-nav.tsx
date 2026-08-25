'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';

const TABS = [
  { href: '/personal/today', label: 'Today' },
  { href: '/personal/goals', label: 'Goals' },
  { href: '/personal/calendar', label: 'Calendar' },
  { href: '/personal/tasks', label: 'Tasks' },
  { href: '/personal/expenses', label: 'Expenses' },
];

export function PersonalNav() {
  const pathname = usePathname();

  return (
    <div className="flex items-center justify-between border-b px-4 py-2">
      <nav className="flex gap-1">
        {TABS.map((tab) => {
          const active = pathname.startsWith(tab.href);
          return (
            <Link key={tab.href} href={tab.href} aria-current={active ? 'page' : undefined} className="relative rounded px-3 py-1 text-sm">
              {active && (
                <motion.span
                  layoutId="personal-nav-active-pill"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  className="absolute inset-0 rounded bg-ink"
                />
              )}
              <span className={`relative ${active ? 'text-parchment' : 'text-ink'}`}>{tab.label}</span>
            </Link>
          );
        })}
      </nav>
      <Link href="/personal/settings" className="text-sm text-ink/60 underline underline-offset-2">Settings</Link>
    </div>
  );
}
