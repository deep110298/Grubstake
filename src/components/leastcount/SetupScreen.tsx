'use client';

import Link from 'next/link';
import { useState } from 'react';
import { HAND_SIZE, INCORRECT_CALL_PENALTY } from '@/lib/leastCount/engine';
import type { Difficulty } from '@/lib/leastCount/ai';
import RulesModal from './RulesModal';

const TARGET_OPTIONS = [50, 100, 150];

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string }[] = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

export default function SetupScreen({
  initialName = '',
  initialTarget = 100,
  initialDifficulty = 'medium',
  onStart,
}: {
  initialName?: string;
  initialTarget?: number;
  initialDifficulty?: Difficulty;
  onStart: (opts: { name: string; target: number; difficulty: Difficulty }) => void;
}) {
  const [name, setName] = useState(initialName);
  const [target, setTarget] = useState(initialTarget);
  const [difficulty, setDifficulty] = useState<Difficulty>(initialDifficulty);
  const [showRules, setShowRules] = useState(false);

  return (
    <div className="flex min-h-dvh flex-col items-center bg-canvas px-6 pb-5 pt-[max(0.75rem,env(safe-area-inset-top))] text-ink">
      <div className="flex w-full max-w-sm items-center justify-between pr-10">
        <Link href="/" className="mono-label text-xs text-ink-soft hover:text-ink">
          ← Home
        </Link>
        <button
          type="button"
          onClick={() => setShowRules(true)}
          className="mono-label text-xs text-ink-soft hover:text-ink"
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

        <div className="flex flex-col gap-2 rounded-[22px] border border-hairline bg-surface-sunken p-5">
          <label htmlFor="player-name" className="mono-label text-[11px] text-ink-soft">
            Your name
          </label>
          <input
            id="player-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            placeholder="You"
            className="rounded-xl border border-input-border bg-canvas px-3.5 py-2.5 text-[15px] text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>

        <div className="flex flex-col gap-3.5 rounded-[22px] border border-hairline bg-surface-sunken p-5">
          <div className="mono-label text-[11px] text-ink-soft">Play to</div>
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

          <div className="mt-1 mono-label text-[11px] text-ink-soft">Difficulty</div>
          <div className="flex gap-2.5">
            {DIFFICULTY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setDifficulty(option.value)}
                className={`flex-1 rounded-[14px] border-2 py-3 text-center font-display text-[15px] font-semibold transition-colors ${
                  difficulty === option.value
                    ? 'border-accent bg-accent/10 font-bold text-accent'
                    : 'border-hairline text-ink-muted hover:bg-surface-sunken-alt'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1" />

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => onStart({ name: name.trim() || 'You', target, difficulty })}
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
