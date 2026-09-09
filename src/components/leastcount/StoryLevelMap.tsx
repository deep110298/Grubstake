'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getWorldLevels, worldName, LEVELS_PER_WORLD, type StoryLevelConfig } from '@/lib/leastCount/storyLevels';
import { getStars, isLevelUnlocked, type Stars } from '@/lib/leastCount/storyProgress';
import StoryFeltBackground from './StoryFeltBackground';
import StoryPathConnector from './StoryPathConnector';

interface LevelStatus {
  config: StoryLevelConfig;
  unlocked: boolean;
  stars: Stars;
}

// Progress lives in localStorage — deferred to the client, same reasoning
// as DailyChallengeBoard's "today" computation.
function buildStatuses(world: number): LevelStatus[] {
  return getWorldLevels(world).map((config) => ({
    config,
    unlocked: isLevelUnlocked(config.globalId),
    stars: getStars(config.globalId),
  }));
}

const OFFSETS = ['0%', '22%', '0%', '-22%'];

export default function StoryLevelMap({ world }: { world: number }) {
  const [levels, setLevels] = useState<LevelStatus[] | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLevels(buildStatuses(world)), 0);
    return () => clearTimeout(timer);
  }, [world]);

  const clearedCount = levels?.filter((l) => l.stars > 0).length ?? 0;

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      <StoryFeltBackground />
      <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-10 pt-4">
        <div className="flex items-center justify-between pr-10">
          <Link href="/play/story" className="mono-label text-xs text-[#cdd8d6] hover:text-white">
            ← Worlds
          </Link>
          <span className="mono-label text-xs text-[#dfe6e4]">
            {clearedCount}/{LEVELS_PER_WORLD} cleared
          </span>
        </div>

        <div className="mt-3 text-center">
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#fbfaf7]">{worldName(world)}</h1>
          <p className="text-sm text-[#d9a8c2]">World {world}</p>
        </div>

        {!levels ? (
          <div className="flex flex-1 items-center justify-center text-sm text-[#a9bcb9]">Loading levels…</div>
        ) : (
          <div className="relative mt-8 flex flex-col items-center gap-7">
            <StoryPathConnector count={levels.length} />
            {levels.map((l, i) => (
              <LevelNode key={l.config.globalId} status={l} offset={OFFSETS[i % OFFSETS.length]} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LevelNode({ status, offset }: { status: LevelStatus; offset: string }) {
  const cleared = status.stars > 0;
  const content = (
    <div
      className={`flex h-14 w-14 flex-none items-center justify-center rounded-full border-2 font-display text-base font-extrabold ${
        cleared
          ? 'border-wild text-white shadow-[0_4px_0_rgba(20,16,24,0.25)]'
          : // Unlocked-but-not-cleared is always exactly the next level to
            // play, since levels unlock strictly in sequence — worth a glow.
            status.unlocked
            ? 'border-wild bg-[#0d2b2e] text-[#f0c8dc] shadow-[0_0_0_8px_rgba(217,89,155,0.14),0_0_24px_rgba(217,89,155,0.35)]'
            : 'border-white/15 bg-white/[0.06] text-white/35 backdrop-blur-sm'
      }`}
      style={cleared ? { background: 'linear-gradient(155deg, #e777ac, #c2367f)' } : undefined}
    >
      {status.unlocked ? status.config.levelInWorld : '🔒'}
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-1" style={{ transform: `translateX(${offset})` }}>
      {status.unlocked ? (
        <Link href={`/play/story/${status.config.globalId}`} className="transition-transform active:scale-90">
          {content}
        </Link>
      ) : (
        content
      )}
      <div className="flex gap-0.5 text-[10px]" aria-hidden>
        {[1, 2, 3].map((i) => (
          <span key={i} style={{ opacity: i <= status.stars ? 1 : 0.18 }}>
            ⭐
          </span>
        ))}
      </div>
    </div>
  );
}
