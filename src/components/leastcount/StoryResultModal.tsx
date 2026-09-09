'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getLevelConfig, TOTAL_LEVELS, worldName } from '@/lib/leastCount/storyLevels';
import { computeStars, recordLevelResult } from '@/lib/leastCount/storyProgress';
import Confetti from './Confetti';
import Modal from './Modal';

export default function StoryResultModal({
  globalId,
  won,
  playerScore,
  target,
  rival,
  onPlayAgain,
}: {
  globalId: number;
  won: boolean;
  playerScore: number;
  target: number;
  rival: string;
  onPlayAgain: () => void;
}) {
  const router = useRouter();
  const config = getLevelConfig(globalId);
  const stars = won ? computeStars(playerScore, target) : 0;
  // Idempotent per level: replaying an already-cleared level for a better
  // star count is expected, so this only ever raises the recorded stars.
  const [{ newlyUnlocked }] = useState(() => recordLevelResult(globalId, won, stars));
  const isLastLevel = globalId >= TOTAL_LEVELS;

  return (
    <>
      {won && <Confetti />}
      <Modal>
        <div className="flex flex-col items-center gap-1.5 text-center">
          <span className="mono-label rounded-full border border-wild/40 bg-wild/[0.12] px-4 py-1.5 text-[11px] text-wild">
            {worldName(config.world)} · Level {config.levelInWorld}
          </span>
          <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-ink">
            {won ? 'Level cleared!' : 'Not this time'}
          </h2>
          {won ? (
            <div className="mt-1 flex gap-1 text-4xl" aria-hidden>
              {[1, 2, 3].map((i) => (
                <span key={i} style={{ opacity: i <= stars ? 1 : 0.2 }}>
                  ⭐
                </span>
              ))}
            </div>
          ) : (
            <span className="call-pop mt-1 text-5xl" style={{ filter: 'grayscale(1)', opacity: 0.55 }} aria-hidden>
              🔥
            </span>
          )}
          <p className="mt-1 text-sm text-ink-muted">
            {won ? `Beat ${rival} — final score ${playerScore}` : `Lost to ${rival} — final score ${playerScore}`}
          </p>
          {newlyUnlocked && isLastLevel && (
            <p className="mono-label mt-1 text-[11px] font-bold text-wild">You&apos;ve cleared every world! 🏆</p>
          )}
          {newlyUnlocked && !isLastLevel && config.levelInWorld === 20 && (
            <p className="mono-label mt-1 text-[11px] font-bold text-wild">
              World cleared — {worldName(config.world + 1)} unlocked!
            </p>
          )}
        </div>

        <div className="mt-5 flex flex-col gap-3">
          {won && !isLastLevel && (
            <button
              type="button"
              onClick={() => router.push(`/play/story/${globalId + 1}`)}
              className="w-full rounded-2xl bg-wild px-4 py-[18px] text-center font-bold text-lg text-white shadow-[0_5px_0_var(--wild-shadow)] transition-transform active:translate-y-[3px] active:shadow-[0_2px_0_var(--wild-shadow)]"
            >
              Next level
            </button>
          )}
          <button
            type="button"
            onClick={onPlayAgain}
            className={
              won && !isLastLevel
                ? 'w-full rounded-2xl border-2 border-hairline-strong px-4 py-4 text-center font-semibold text-lg text-ink transition-colors hover:bg-surface-sunken'
                : 'w-full rounded-2xl bg-wild px-4 py-[18px] text-center font-bold text-lg text-white shadow-[0_5px_0_var(--wild-shadow)] transition-transform active:translate-y-[3px] active:shadow-[0_2px_0_var(--wild-shadow)]'
            }
          >
            {won ? 'Replay for more stars' : 'Retry level'}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/play/story/world/${config.world}`)}
            className="w-full rounded-2xl border-2 border-hairline-strong px-4 py-4 text-center font-semibold text-lg text-ink transition-colors hover:bg-surface-sunken"
          >
            Back to map
          </button>
        </div>
      </Modal>
    </>
  );
}
