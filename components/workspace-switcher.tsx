'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function WorkspaceSwitcher() {
  const pathname = usePathname();
  const active = pathname.startsWith('/org') ? 'org' : 'personal';

  return (
    <nav className="flex gap-1 rounded-lg bg-indigo-700 p-1">
      <Link href="/personal/today"
        className={`rounded px-3 py-1 text-sm ${active === 'personal' ? 'bg-brass text-ink' : 'text-parchment'}`}>
        Personal
      </Link>
      <Link href="/org/projects"
        className={`rounded px-3 py-1 text-sm ${active === 'org' ? 'bg-brass text-ink' : 'text-parchment'}`}>
        Org
      </Link>
    </nav>
  );
}
