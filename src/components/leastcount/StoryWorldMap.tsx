'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { getWorldLevels, worldName, WORLD_COUNT, TOTAL_LEVELS, LEVELS_PER_WORLD } from '@/lib/leastCount/storyLevels';
import { getStars, getTotalStars, isWorldCleared, isWorldUnlocked } from '@/lib/leastCount/storyProgress';
import { SNAKE_DESIGN_WIDTH, getSnakeHeight, getSnakePoints, buildSmoothPath, type SnakePoint } from '@/lib/leastCount/snakeLayout';
import { STORY_GLOW_STYLE } from './storyBackdrop';

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

export default function StoryWorldMap() {
  const [status, setStatus] = useState<MapStatus | null>(null);
  const currentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setStatus(buildStatus()), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (status) {
      currentRef.current?.scrollIntoView({ block: 'center' });
    }
  }, [status]);

  const points = useMemo(() => getSnakePoints(WORLD_COUNT), []);
  const height = getSnakeHeight(WORLD_COUNT);
  const pathD = useMemo(() => buildSmoothPath(points), [points]);
  const currentIndex = status?.worlds.findIndex((w) => w.unlocked && !w.cleared) ?? -1;

  return (
    <div className="relative min-h-dvh bg-canvas">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[380px]" style={STORY_GLOW_STYLE} aria-hidden />

      <div className="mx-auto w-full max-w-md px-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
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
          <p className="text-sm text-ink-muted">Clear every world to unlock the next.</p>
        </div>
      </div>

      {!status ? (
        <div className="flex min-h-[50dvh] items-center justify-center text-sm text-ink-muted">Loading progress…</div>
      ) : (
        <div className="relative mx-auto mt-4 w-full max-w-md pb-10" style={{ aspectRatio: `${SNAKE_DESIGN_WIDTH} / ${height}` }}>
          <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${SNAKE_DESIGN_WIDTH} ${height}`} preserveAspectRatio="none" aria-hidden>
            <path d={pathD} fill="none" stroke="#d8a8c2" strokeWidth="4" strokeLinecap="round" strokeDasharray="1 14" opacity="0.9" />
          </svg>

          {status.worlds.map((w, i) => (
            <WorldNode
              key={w.world}
              status={w}
              point={points[i]}
              height={height}
              nodeRef={i === currentIndex ? currentRef : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function WorldNode({
  status,
  point,
  height,
  nodeRef,
}: {
  status: WorldStatus;
  point: SnakePoint;
  height: number;
  nodeRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const isCurrent = status.unlocked && !status.cleared;

  const chip = (
    <div
      ref={nodeRef}
      className={`flex flex-none items-center justify-center rounded-full border-[3px] font-display font-extrabold shadow-[0_4px_0_rgba(0,0,0,0.12)] ${
        status.cleared
          ? 'h-14 w-14 border-[#f0cf70] bg-[#2d7a52] text-lg text-white'
          : isCurrent
            ? 'h-[62px] w-[62px] border-[#ffe1f0] bg-wild text-xl text-white shadow-[0_4px_0_rgba(0,0,0,0.12),0_0_0_5px_rgba(194,54,127,0.16)]'
            : 'h-14 w-14 border-hairline-strong bg-surface-sunken text-lg text-ink-faint'
      }`}
    >
      {status.cleared ? '✓' : status.unlocked ? status.world : '🔒'}
    </div>
  );

  return (
    <div
      className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
      style={{ left: `${(point.x / SNAKE_DESIGN_WIDTH) * 100}%`, top: `${(point.y / height) * 100}%` }}
    >
      {status.unlocked ? (
        <Link href={`/play/story/world/${status.world}`} className="transition-transform active:scale-90">
          {chip}
        </Link>
      ) : (
        chip
      )}
      <span className={`mono-label text-[10px] ${status.unlocked ? 'text-wild' : 'text-ink-faint'}`}>{worldName(status.world)}</span>
      {status.unlocked && <span className="mono-label text-[9px] text-ink-faint">{status.levelsCleared}/{LEVELS_PER_WORLD}</span>}
    </div>
  );
}
