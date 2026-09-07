'use client';

import { useState } from 'react';
import RulesModal from './RulesModal';

const TARGET_OPTIONS = [50, 100, 150];

export default function SetupScreen({ onStart }: { onStart: (target: number) => void }) {
  const [target, setTarget] = useState(100);
  const [showRules, setShowRules] = useState(false);

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center gap-6 bg-canvas px-4 py-10 text-center">
      <div>
        <h1 className="text-3xl font-semibold text-ink">Least Count</h1>
        <p className="mt-2 max-w-xs text-sm text-ink-muted">
          Keep your hand&apos;s value low, call when you think you&apos;re lowest, and beat the computer to the finish.
        </p>
      </div>

      <div className="w-full max-w-xs rounded-xl border border-hairline bg-surface p-4">
        <div className="mono-label text-xs text-ink-faint">Play to</div>
        <div className="mt-2 flex gap-2">
          {TARGET_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setTarget(option)}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                target === option
                  ? 'border-accent bg-accent-tint text-accent'
                  : 'border-hairline text-ink-muted hover:bg-surface-sunken'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-2">
        <button
          type="button"
          onClick={() => onStart(target)}
          className="w-full rounded-lg bg-accent px-4 py-3 font-medium text-white transition-opacity hover:opacity-90"
        >
          Start game
        </button>
        <button
          type="button"
          onClick={() => setShowRules(true)}
          className="w-full rounded-lg border border-hairline px-4 py-2.5 font-medium text-ink transition-colors hover:bg-surface-sunken"
        >
          How to play
        </button>
      </div>

      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
    </div>
  );
}
