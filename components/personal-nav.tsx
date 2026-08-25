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
    <div className="flex items-end justify-between bg-ink px-4 pt-3">
      <nav className="flex gap-1">
        {TABS.map((tab) => {
          const active = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? 'page' : undefined}
              className="relative rounded-t-lg px-4 py-2 text-sm"
            >
              {active && (
                <motion.span
                  layoutId="personal-nav-active-pill"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  className="absolute inset-0 rounded-t-lg bg-parchment"
                />
              )}
              <span className={`relative ${active ? 'font-semibold text-ink' : 'text-parchment-dim'}`}>{tab.label}</span>
            </Link>
          );
        })}
      </nav>
      <Link href="/personal/settings" className="mb-2 text-sm text-parchment-dim underline underline-offset-2">Settings</Link>
    </div>
  );
}
