'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { getWorldLevels, worldName, LEVELS_PER_WORLD, type StoryLevelConfig } from '@/lib/leastCount/storyLevels';
import { getStars, isLevelUnlocked, type Stars } from '@/lib/leastCount/storyProgress';
import { STORY_GLOW_STYLE } from './storyBackdrop';

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

export default function StoryLevelMap({ world }: { world: number }) {
  const [levels, setLevels] = useState<LevelStatus[] | null>(null);
  const currentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLevels(buildStatuses(world)), 0);
    return () => clearTimeout(timer);
  }, [world]);

  useEffect(() => {
    if (levels) {
      currentRef.current?.scrollIntoView({ block: 'center' });
    }
  }, [levels]);

  const clearedCount = levels?.filter((l) => l.stars > 0).length ?? 0;
  const currentIndex = levels?.findIndex((l) => l.unlocked && l.stars === 0) ?? -1;

  return (
    <div className="relative min-h-dvh bg-canvas">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[380px]" style={STORY_GLOW_STYLE} aria-hidden />

      <div className="sticky top-0 z-20 flex items-center justify-between gap-2 bg-canvas pb-3 pl-4 pr-12 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <Link href="/play/story" className="mono-label text-xs font-bold text-ink-soft hover:text-ink">
          ← Worlds
        </Link>
        <span className="mono-label rounded-full bg-wild/10 px-2.5 py-1 text-xs font-bold text-wild">
          {clearedCount}/{LEVELS_PER_WORLD} cleared
        </span>
      </div>

      <div className="mx-auto w-full max-w-md px-4 pb-10">
        <div className="mb-6 mt-1 text-center">
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">{worldName(world)}</h1>
          <p className="text-sm text-ink-muted">World {world}</p>
        </div>

        {!levels ? (
          <div className="flex min-h-[50dvh] items-center justify-center text-sm text-ink-muted">Loading levels…</div>
        ) : (
          <div className="grid grid-cols-4 gap-2.5">
            {levels.map((l, i) => (
              <LevelBox key={l.config.globalId} status={l} isCurrent={i === currentIndex} boxRef={i === currentIndex ? currentRef : undefined} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LevelBox({
  status,
  isCurrent,
  boxRef,
}: {
  status: LevelStatus;
  isCurrent: boolean;
  boxRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const cleared = status.stars > 0;

  const box = (
    <div
      ref={boxRef}
      className={`flex aspect-[5/7] flex-col items-center justify-center gap-1.5 rounded-lg border-[1.5px] font-display transition-transform active:scale-95 ${
        cleared
          ? 'border-hairline-strong bg-surface shadow-[0_2px_6px_-2px_rgba(20,16,24,0.12)]'
          : isCurrent
            ? 'border-2 border-wild bg-surface shadow-[0_0_0_4px_rgba(194,54,127,0.16)]'
            : 'border-hairline-strong bg-surface-sunken'
      }`}
    >
      {status.unlocked ? (
        <>
          <span className={`text-[11px] font-bold tracking-wide ${isCurrent ? 'text-wild' : 'text-ink-soft'}`}>
            Level {status.config.levelInWorld}
          </span>
          {cleared && (
            <span className="text-[11px] tracking-[2px]">
              {[1, 2, 3].map((i) => (
                <span key={i} className={i <= status.stars ? 'text-[#e0a500]' : 'text-ink-faint/40'}>
                  ★
                </span>
              ))}
            </span>
          )}
        </>
      ) : (
        <span className="text-lg text-ink-faint opacity-70">🔒</span>
      )}
    </div>
  );

  return status.unlocked ? (
    <Link href={`/play/story/${status.config.globalId}`}>{box}</Link>
  ) : (
    box
  );
}
