'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TOTAL_LEVELS, worldName, worldOf, levelInWorldOf } from '@/lib/leastCount/storyLevels';
import { getFurthestUnlocked, getTotalStars } from '@/lib/leastCount/storyProgress';

interface StoryStatus {
  furthestUnlocked: number;
  totalStars: number;
}

// Progress lives in localStorage — deferred to the client, same reasoning
// as DailyChallengeCard's status.
function buildStatus(): StoryStatus {
  return { furthestUnlocked: getFurthestUnlocked(), totalStars: getTotalStars() };
}

export default function StoryModeCard() {
  const [status, setStatus] = useState<StoryStatus | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setStatus(buildStatus()), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!status) return null;

  const cleared = status.furthestUnlocked > TOTAL_LEVELS;
  const started = status.furthestUnlocked > 1 || status.totalStars > 0;
  const world = worldOf(Math.min(status.furthestUnlocked, TOTAL_LEVELS));
  const levelInWorld = levelInWorldOf(Math.min(status.furthestUnlocked, TOTAL_LEVELS));

  return (
    <Link
      href="/play/story"
      className="block rounded-[18px] border-[1.5px] border-wild p-3.5 text-left transition-transform active:scale-[0.98]"
      style={{ background: 'linear-gradient(155deg, var(--wild-soft), var(--surface) 65%)' }}
    >
      <div className="flex items-center justify-between">
        <span className="mono-label flex items-center gap-1.5 text-[10px] text-wild">
          <span aria-hidden>♠</span> Story mode
        </span>
        {status.totalStars > 0 && (
          <span className="mono-label text-[10px] font-bold text-wild">⭐ {status.totalStars}</span>
        )}
      </div>

      <div className="mt-2 font-display text-[15px] font-extrabold text-ink">
        {cleared ? 'All worlds cleared! 🏆' : started ? `World ${world} · Level ${levelInWorld}` : 'Begin Story Mode'}
      </div>
      <div className="mt-0.5 text-xs text-ink-muted">
        {cleared ? `${status.totalStars}/${TOTAL_LEVELS * 3} stars` : started ? worldName(world) : '25 worlds · 500 levels'}
      </div>
    </Link>
  );
}
