'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getWorldLevels, worldName, LEVELS_PER_WORLD, type StoryLevelConfig } from '@/lib/leastCount/storyLevels';
import { getStars, isLevelUnlocked, type Stars } from '@/lib/leastCount/storyProgress';

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
    <div className="flex min-h-dvh flex-col bg-canvas">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-10 pt-4">
        <div className="flex items-center justify-between">
          <Link href="/play/story" className="mono-label text-xs text-ink-soft hover:text-ink">
            ← Worlds
          </Link>
          <span className="mono-label text-xs text-ink-soft">
            {clearedCount}/{LEVELS_PER_WORLD} cleared
          </span>
        </div>

        <div className="mt-3 text-center">
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">{worldName(world)}</h1>
          <p className="text-sm text-ink-muted">World {world}</p>
        </div>

        {!levels ? (
          <div className="flex flex-1 items-center justify-center text-sm text-ink-muted">Loading levels…</div>
        ) : (
          <div className="mt-8 flex flex-col items-center gap-7">
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
      className={`flex h-14 w-14 flex-none items-center justify-center rounded-full border-2 font-display text-base font-extrabold shadow-[0_4px_0_rgba(20,16,24,0.13)] ${
        cleared
          ? 'border-wild bg-wild text-white'
          : status.unlocked
            ? 'border-wild bg-surface text-wild'
            : 'border-hairline-strong bg-surface-sunken text-ink-faint'
      }`}
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
