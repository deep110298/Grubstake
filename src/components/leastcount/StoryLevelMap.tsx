'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { getWorldLevels, worldName, LEVELS_PER_WORLD, type StoryLevelConfig } from '@/lib/leastCount/storyLevels';
import { getStars, isLevelUnlocked, type Stars } from '@/lib/leastCount/storyProgress';
import { CASINO_BACKDROP_STYLE } from './casinoTheme';

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
    <div className="min-h-dvh" style={CASINO_BACKDROP_STYLE}>
      <div className="sticky top-0 z-20 flex items-center justify-between gap-2 bg-gradient-to-b from-black/55 to-transparent pb-3 pl-4 pr-12 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <Link href="/play/story" className="mono-label text-xs font-bold text-white">
          ← Worlds
        </Link>
        <span className="mono-label rounded-full bg-black/35 px-2.5 py-1 text-xs font-bold text-[#ffd873]">
          {clearedCount}/{LEVELS_PER_WORLD} cleared
        </span>
      </div>

      <div className="mx-auto w-full max-w-md px-4 pb-10">
        <div className="mx-auto mb-6 mt-1 w-fit rounded-[10px] border-2 border-[#d4af37] bg-gradient-to-b from-[#2a0d17] to-[#1a0810] px-7 py-2.5 shadow-[0_4px_0_rgba(0,0,0,0.35),0_0_18px_rgba(212,175,55,0.25)]">
          <div className="text-center text-lg font-extrabold tracking-wide text-[#f0cf70]">
            {worldName(world).toUpperCase()}
          </div>
        </div>

        {!levels ? (
          <div className="flex min-h-[50dvh] items-center justify-center text-sm text-white/60">Loading levels…</div>
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
          ? 'border-[#ffd873] bg-gradient-to-b from-[#241017] to-[#160709] shadow-[0_2px_8px_-2px_rgba(0,0,0,0.5)]'
          : isCurrent
            ? 'border-2 border-[#c2367f] bg-gradient-to-b from-[#3a1220] to-[#26101a] shadow-[0_0_0_4px_rgba(194,54,127,0.22),0_2px_10px_-2px_rgba(0,0,0,0.5)]'
            : 'border-[#d4af37]/25 bg-black/25'
      }`}
    >
      {status.unlocked ? (
        <>
          <span className={`text-[11px] font-bold tracking-wide ${isCurrent ? 'text-[#ffe1f0]' : 'text-[#f0cf70]'}`}>
            Level {status.config.levelInWorld}
          </span>
          {cleared && (
            <span className="text-[11px] tracking-[2px]">
              {[1, 2, 3].map((i) => (
                <span key={i} className={i <= status.stars ? 'text-[#ffd873]' : 'text-white/25'}>
                  ★
                </span>
              ))}
            </span>
          )}
        </>
      ) : (
        <span className="text-lg opacity-50">🔒</span>
      )}
    </div>
  );

  return status.unlocked ? (
    <Link href={`/play/story/${status.config.globalId}`}>{box}</Link>
  ) : (
    box
  );
}
