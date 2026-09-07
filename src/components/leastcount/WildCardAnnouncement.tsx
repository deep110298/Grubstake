'use client';

import { useEffect, useState } from 'react';
import type { Rank } from '@/lib/leastCount/types';

// Announces the round's wild card for a few seconds whenever it changes
// (including the very first round). Adjusts state during render to detect
// the change, per https://react.dev/learn/you-might-not-need-an-effect,
// then uses an effect only for the actual side effect: the dismiss timer.
export default function WildCardAnnouncement({ jokerRank }: { jokerRank: Rank }) {
  const [seenRank, setSeenRank] = useState(jokerRank);
  const [visible, setVisible] = useState(true);

  if (seenRank !== jokerRank) {
    setSeenRank(jokerRank);
    setVisible(true);
  }

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => setVisible(false), 2800);
    return () => clearTimeout(timer);
  }, [visible, seenRank]);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <div className="flex items-center gap-2 rounded-full border border-warn-in-progress bg-warn-surface px-4 py-2 text-sm font-semibold text-warn shadow-md">
        🃏 New wild card: {jokerRank}
      </div>
    </div>
  );
}
