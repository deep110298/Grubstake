'use client';

import Link from 'next/link';
import { useState } from 'react';
import { HAND_SIZE, INCORRECT_CALL_PENALTY, DECLARE_THRESHOLD } from '@/lib/leastCount/engine';
import RulesModal from './RulesModal';

const TARGET_OPTIONS = [50, 100, 150];

const RULES = [
  'Discard one card, or several of the same rank.',
  'Match the pile and you skip the draw. Otherwise pick up.',
  `Call at ${DECLARE_THRESHOLD} or less. Lowest hand wins the round.`,
];

export default function SetupScreen({ onStart }: { onStart: (target: number) => void }) {
  const [target, setTarget] = useState(100);
  const [showRules, setShowRules] = useState(false);

  return (
    <div className="flex min-h-dvh flex-col items-center bg-canvas px-6 pb-5 pt-1.5 text-ink">
      <div className="flex w-full max-w-sm items-center justify-between">
        <Link href="/" className="mono-label text-xs text-ink-muted hover:text-ink">
          ← Home
        </Link>
        <button
          type="button"
          onClick={() => setShowRules(true)}
          className="mono-label text-xs text-ink-muted hover:text-ink"
        >
          Rules
        </button>
      </div>

      <div className="flex w-full max-w-sm flex-1 flex-col gap-4 pt-5">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-[34px] font-extrabold leading-tight tracking-tight">Play vs Computer</h1>
          <p className="text-[15px] leading-relaxed text-ink-muted">
            {HAND_SIZE} cards each. Call it before the computer does.
          </p>
        </div>

        <div className="flex flex-col gap-3.5 rounded-[22px] border border-hairline bg-surface-sunken p-5">
          <div className="mono-label text-[11px] text-ink-muted">Play to</div>
          <div className="flex gap-2.5">
            {TARGET_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setTarget(option)}
                className={`flex-1 rounded-[14px] border-2 py-3.5 text-center font-display text-lg font-semibold transition-colors ${
                  target === option
                    ? 'border-accent bg-accent/10 font-bold text-accent'
                    : 'border-hairline text-ink-muted hover:bg-surface-sunken-alt'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          <p className="text-[13px] leading-relaxed text-ink-muted">
            First to {target} points loses. A wrong call costs you {INCORRECT_CALL_PENALTY}.
          </p>
        </div>

        <div className="flex flex-col gap-3.5 rounded-[22px] border border-hairline bg-surface-sunken p-5">
          <div className="mono-label text-[11px] text-ink-muted">The three rules</div>
          {RULES.map((rule, i) => (
            <div key={rule} className="flex items-start gap-3">
              <div className="mono-label flex h-6 w-6 flex-none items-center justify-center rounded-lg bg-hairline text-xs font-bold text-accent">
                {i + 1}
              </div>
              <p className="text-sm leading-relaxed text-ink-soft">{rule}</p>
            </div>
          ))}
        </div>

        <div className="flex-1" />

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => onStart(target)}
            className="rounded-[18px] bg-accent px-4 py-[18px] text-center font-bold text-lg text-white shadow-[0_5px_0_var(--accent-shadow)] transition-transform active:translate-y-[3px] active:shadow-[0_2px_0_var(--accent-shadow)]"
          >
            Start game
          </button>
          <button
            type="button"
            onClick={() => setShowRules(true)}
            className="rounded-[18px] border-2 border-hairline-strong px-4 py-4 text-center font-semibold text-lg transition-colors hover:bg-surface-sunken"
          >
            How to play
          </button>
        </div>
      </div>

      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
    </div>
  );
}
