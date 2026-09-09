'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { getWorldLevels, worldName, LEVELS_PER_WORLD, type StoryLevelConfig } from '@/lib/leastCount/storyLevels';
import { getStars, isLevelUnlocked, type Stars } from '@/lib/leastCount/storyProgress';
import { TRAIL_DESIGN_WIDTH, getTrailHeight, getTrailPoints, buildSmoothPath, type TrailPoint } from '@/lib/leastCount/trailLayout';

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

const SUIT_PROPS: { suit: string; dx: number; dy: number }[] = [
  { suit: '♦', dx: 82, dy: -34 },
  { suit: '♣', dx: -86, dy: 18 },
  { suit: '♥', dx: 88, dy: -10 },
  { suit: '♦', dx: -80, dy: 24 },
  { suit: '♣', dx: 84, dy: -20 },
];

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

  const points = useMemo(() => getTrailPoints(LEVELS_PER_WORLD), []);
  const height = getTrailHeight(LEVELS_PER_WORLD);
  const pathD = useMemo(() => buildSmoothPath(points), [points]);
  const clearedCount = levels?.filter((l) => l.stars > 0).length ?? 0;
  const currentIndex = levels?.findIndex((l) => l.unlocked && l.stars === 0) ?? -1;

  return (
    <div className="min-h-dvh bg-[#160709]">
      <div className="sticky top-0 z-20 flex items-center justify-between gap-2 bg-gradient-to-b from-black/55 to-transparent pb-3 pl-4 pr-12 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <Link href="/play/story" className="mono-label text-xs font-bold text-white">
          ← Worlds
        </Link>
        <span className="mono-label rounded-full bg-black/35 px-2.5 py-1 text-xs font-bold text-[#ffd873]">
          {clearedCount}/{LEVELS_PER_WORLD} cleared
        </span>
      </div>

      {!levels ? (
        <div className="flex min-h-[70dvh] items-center justify-center text-sm text-white/60">Loading levels…</div>
      ) : (
        <div className="relative mx-auto w-full max-w-md" style={{ aspectRatio: `${TRAIL_DESIGN_WIDTH} / ${height}` }}>
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox={`0 0 ${TRAIL_DESIGN_WIDTH} ${height}`}
            preserveAspectRatio="none"
            aria-hidden
          >
            <defs>
              <pattern id="carpet" width="64" height="64" patternUnits="userSpaceOnUse">
                <path d="M32 4 L60 32 L32 60 L4 32 Z" fill="none" stroke="#d4af37" strokeWidth="1.3" opacity="0.4" />
                <circle cx="32" cy="32" r="4" fill="#d4af37" opacity="0.3" />
                <path d="M0 32 L32 0 M32 0 L64 32 M64 32 L32 64 M32 64 L0 32" stroke="#d4af37" strokeWidth="0.6" opacity="0.16" />
              </pattern>
              <radialGradient id="topGlow" gradientUnits="userSpaceOnUse" cx={TRAIL_DESIGN_WIDTH / 2} cy="90" r="320">
                <stop offset="0%" stopColor="#3d1220" />
                <stop offset="60%" stopColor="#2a0d17" />
                <stop offset="100%" stopColor="#160709" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="spotlight" gradientUnits="userSpaceOnUse" cx={TRAIL_DESIGN_WIDTH / 2} cy="70" r="260">
                <stop offset="0%" stopColor="#f0cf70" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#f0cf70" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width={TRAIL_DESIGN_WIDTH} height={height} fill="#160709" />
            <rect width={TRAIL_DESIGN_WIDTH} height={height} fill="url(#carpet)" />
            <rect width={TRAIL_DESIGN_WIDTH} height={height} fill="url(#topGlow)" />
            <rect width={TRAIL_DESIGN_WIDTH} height={height} fill="url(#spotlight)" />
            <path d={pathD} fill="none" stroke="#f0cf70" strokeWidth="9" strokeLinecap="round" strokeDasharray="1 18" opacity="0.85" />

            {points
              .map((p, i) => ({ p, i }))
              .filter(({ i }) => i % 4 === 2 && SUIT_PROPS[(i / 4) | 0])
              .map(({ p, i }) => {
                const prop = SUIT_PROPS[(i / 4) | 0];
                return (
                  <text
                    key={i}
                    x={p.x + prop.dx}
                    y={p.y + prop.dy}
                    fontSize="20"
                    fill="#8a6a3a"
                    opacity="0.75"
                    textAnchor="middle"
                  >
                    {prop.suit}
                  </text>
                );
              })}
          </svg>

          <div
            className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[10px] border-2 border-[#d4af37] bg-gradient-to-b from-[#2a0d17] to-[#1a0810] px-6 py-2.5 shadow-[0_4px_0_rgba(0,0,0,0.35),0_0_18px_rgba(212,175,55,0.25)]"
            style={{ top: `${(70 / height) * 100}%` }}
          >
            <div className="text-center text-base font-extrabold tracking-wide text-[#f0cf70]">
              {worldName(world).toUpperCase()}
            </div>
          </div>

          {levels.map((l, i) => (
            <LevelNode
              key={l.config.globalId}
              status={l}
              point={points[i]}
              height={height}
              isCurrent={i === currentIndex}
              nodeRef={i === currentIndex ? currentRef : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function LevelNode({
  status,
  point,
  height,
  isCurrent,
  nodeRef,
}: {
  status: LevelStatus;
  point: TrailPoint;
  height: number;
  isCurrent: boolean;
  nodeRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const cleared = status.stars > 0;

  const chip = (
    <div
      className={`flex h-[46px] w-[46px] flex-none items-center justify-center rounded-full border-[3px] font-display text-base font-extrabold shadow-[0_4px_0_rgba(0,0,0,0.25),0_0_0_3px_rgba(255,255,255,0.06)_inset] ${
        cleared
          ? 'border-[#ffd873] bg-[#2d7a52] text-white'
          : isCurrent
            ? 'h-[52px] w-[52px] border-[#ffe1f0] bg-[#c2367f] text-white shadow-[0_4px_0_rgba(0,0,0,0.25),0_0_0_6px_rgba(194,54,127,0.3)]'
            : 'border-white/20 bg-white/10 text-sm text-white/50'
      }`}
    >
      {status.unlocked ? status.config.levelInWorld : '🔒'}
    </div>
  );

  return (
    <div
      ref={nodeRef}
      className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
      style={{ left: `${(point.x / TRAIL_DESIGN_WIDTH) * 100}%`, top: `${(point.y / height) * 100}%` }}
    >
      {isCurrent && (
        <span className="relative mb-1 whitespace-nowrap rounded-md bg-[#ffd873] px-2 py-0.5 text-[10px] font-extrabold text-[#4a2d18] after:absolute after:left-1/2 after:top-full after:-translate-x-1/2 after:border-x-4 after:border-t-4 after:border-x-transparent after:border-t-[#ffd873]">
          LEVEL {status.config.levelInWorld}
        </span>
      )}
      {status.unlocked ? (
        <Link href={`/play/story/${status.config.globalId}`} className="transition-transform active:scale-90">
          {chip}
        </Link>
      ) : (
        chip
      )}
      {cleared && (
        <div className="mt-1.5 rounded-lg bg-black/40 px-1.5 py-0.5 text-[11px] tracking-[2px]">
          {[1, 2, 3].map((i) => (
            <span key={i} className={i <= status.stars ? 'text-[#ffd873]' : 'text-white/30'}>
              ★
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
