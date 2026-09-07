'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function LeastCountLink() {
  const pathname = usePathname();
  if (pathname?.startsWith('/least-count')) return null;

  return (
    <Link
      href="/least-count"
      className="mono-label fixed right-4 top-4 z-40 rounded-full border border-hairline bg-surface px-3 py-1.5 text-xs text-ink-muted shadow-sm transition-colors hover:text-ink"
    >
      🃏 Least Count
    </Link>
  );
}
