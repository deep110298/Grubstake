'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getWorldLevels, worldName, WORLD_COUNT, TOTAL_LEVELS, LEVELS_PER_WORLD } from '@/lib/leastCount/storyLevels';
import { getStars, getTotalStars, isWorldCleared, isWorldUnlocked } from '@/lib/leastCount/storyProgress';
import { CASINO_BACKDROP_STYLE } from './casinoTheme';

interface WorldStatus {
  world: number;
  unlocked: boolean;
  cleared: boolean;
  levelsCleared: number;
}

interface MapStatus {
  totalStars: number;
  worlds: WorldStatus[];
}

// Progress lives in localStorage — deferred to the client, same reasoning
// as DailyChallengeBoard's "today" computation.
function buildStatus(): MapStatus {
  const worlds: WorldStatus[] = [];
  for (let world = 1; world <= WORLD_COUNT; world++) {
    const levels = getWorldLevels(world);
    const levelsCleared = levels.filter((l) => getStars(l.globalId) > 0).length;
    worlds.push({ world, unlocked: isWorldUnlocked(world), cleared: isWorldCleared(world), levelsCleared });
  }
  return { totalStars: getTotalStars(), worlds };
}

// A gentle left/right/center wiggle so the worlds read as a winding path
// rather than a plain list.
const OFFSETS = ['0%', '22%', '0%', '-22%'];

export default function StoryWorldMap() {
  const [status, setStatus] = useState<MapStatus | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setStatus(buildStatus()), 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-dvh">
      <div className="pointer-events-none fixed inset-0 -z-10" style={CASINO_BACKDROP_STYLE} aria-hidden />
      <div className="pb-8 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="mx-auto w-full max-w-md px-4">
          <div className="flex items-center justify-between pr-12">
            <Link href="/" className="mono-label text-xs font-bold text-ink-soft hover:text-ink">
              ← Home
            </Link>
            {status && (
              <span className="mono-label rounded-full bg-wild/10 px-2.5 py-1 text-xs font-bold text-wild">
                ⭐ {status.totalStars}/{TOTAL_LEVELS * 3}
              </span>
            )}
          </div>

          <div className="mt-3 flex flex-col gap-1 text-center">
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">Story Mode</h1>
            <p className="text-sm text-ink-muted">Clear every level in a world to unlock the next.</p>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-md flex-col px-4 pb-10">
        {!status ? (
          <div className="flex flex-1 items-center justify-center py-20 text-sm text-ink-muted">Loading progress…</div>
        ) : (
          <div className="mt-8 flex flex-col items-center gap-7">
            {status.worlds.map((w, i) => (
              <WorldNode key={w.world} status={w} offset={OFFSETS[i % OFFSETS.length]} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function WorldNode({ status, offset }: { status: WorldStatus; offset: string }) {
  const content = (
    <div
      className={`flex h-16 w-16 flex-none flex-col items-center justify-center rounded-full border-2 font-display text-lg font-extrabold shadow-[0_4px_0_rgba(0,0,0,0.3)] ${
        status.cleared
          ? 'border-[#ffd873] bg-[#2d7a52] text-white'
          : status.unlocked
            ? 'border-[#ffe1f0] bg-[#c2367f] text-white'
            : 'border-black/10 bg-black/5 text-ink-faint'
      }`}
    >
      {status.cleared ? '✓' : status.unlocked ? status.world : '🔒'}
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-1.5" style={{ transform: `translateX(${offset})` }}>
      {status.unlocked ? (
        <Link href={`/play/story/world/${status.world}`} className="transition-transform active:scale-90">
          {content}
        </Link>
      ) : (
        content
      )}
      <span className={`mono-label text-[10px] ${status.unlocked ? 'text-wild' : 'text-ink-faint'}`}>
        {worldName(status.world)}
      </span>
      {status.unlocked && <span className="mono-label text-[9px] text-ink-faint">{status.levelsCleared}/{LEVELS_PER_WORLD}</span>}
    </div>
  );
}
