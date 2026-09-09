'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getWorldLevels, worldName, WORLD_COUNT, TOTAL_LEVELS, LEVELS_PER_WORLD } from '@/lib/leastCount/storyLevels';
import { getStars, getTotalStars, isWorldCleared, isWorldUnlocked } from '@/lib/leastCount/storyProgress';
import StoryFeltBackground from './StoryFeltBackground';
import StoryPathConnector from './StoryPathConnector';

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
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      <StoryFeltBackground />
      <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-10 pt-4">
        <div className="flex items-center justify-between pr-10">
          <Link href="/" className="mono-label text-xs text-[#cdd8d6] hover:text-white">
            ← Home
          </Link>
          {status && (
            <span className="mono-label flex items-center gap-1 text-xs font-bold text-[#e8b84b]">
              ⭐ {status.totalStars}/{TOTAL_LEVELS * 3}
            </span>
          )}
        </div>

        <div className="mt-3 flex flex-col gap-1 text-center">
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#fbfaf7]">Story Mode</h1>
          <p className="text-sm text-[#a9bcb9]">Clear every level in a world to unlock the next.</p>
        </div>

        {!status ? (
          <div className="flex flex-1 items-center justify-center text-sm text-[#a9bcb9]">Loading progress…</div>
        ) : (
          <div className="relative mt-8 flex flex-col items-center gap-7">
            <StoryPathConnector count={status.worlds.length} />
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
      className={`flex h-16 w-16 flex-none flex-col items-center justify-center rounded-full border-2 font-display text-lg font-extrabold ${
        status.cleared
          ? 'border-wild text-white shadow-[0_4px_0_rgba(20,16,24,0.25)]'
          : // Unlocked-but-not-cleared is always exactly the current world,
            // since worlds unlock strictly in sequence — worth a glow.
            status.unlocked
            ? 'border-wild bg-[#0d2b2e] text-[#f0c8dc] shadow-[0_0_0_8px_rgba(217,89,155,0.14),0_0_24px_rgba(217,89,155,0.35)]'
            : 'border-white/15 bg-white/[0.06] text-white/35 backdrop-blur-sm'
      }`}
      style={status.cleared ? { background: 'linear-gradient(155deg, #e777ac, #c2367f)' } : undefined}
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
      <span className={`mono-label text-[10px] ${status.unlocked ? 'text-[#dfe6e4]' : 'text-white/35'}`}>
        {worldName(status.world)}
      </span>
      {status.unlocked && (
        <span className="mono-label text-[9px] text-white/45">
          {status.levelsCleared}/{LEVELS_PER_WORLD}
        </span>
      )}
    </div>
  );
}
