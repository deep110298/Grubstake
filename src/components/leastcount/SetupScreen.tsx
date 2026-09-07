'use client';

import type { CSSProperties } from 'react';
import Link from 'next/link';
import { useState } from 'react';
import Logo from './Logo';
import PlayingCard from './PlayingCard';
import RulesModal from './RulesModal';

const TARGET_OPTIONS = [50, 100, 150];

export default function SetupScreen({ onStart }: { onStart: (target: number) => void }) {
  const [target, setTarget] = useState(100);
  const [showRules, setShowRules] = useState(false);

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center gap-6 bg-canvas px-4 py-10 text-center">
      <Link href="/" className="mono-label absolute left-4 top-4 text-xs text-ink-faint hover:text-ink">
        ← Home
      </Link>

      <Logo size="sm" className="fade-up" />

      <div className="hero-card" style={{ '--card-tilt': '-8deg', '--card-lift': '0px' } as CSSProperties}>
        <div className="hero-card-inner">
          <PlayingCard card={{ id: 'setup-hero', suit: 'spades', rank: 'A' }} jokerRank="A" size="md" />
        </div>
      </div>

      <div>
        <h1 className="fade-up font-display text-3xl font-semibold tracking-tight text-ink" style={{ animationDelay: '80ms' }}>
          Play vs Computer
        </h1>
        <p className="fade-up mt-2 max-w-xs text-sm text-ink-muted" style={{ animationDelay: '160ms' }}>
          Keep your hand low and call it before the computer does.
        </p>
      </div>

      <div
        className="fade-up w-full max-w-xs rounded-2xl border border-hairline bg-surface p-4"
        style={{ animationDelay: '240ms' }}
      >
        <div className="mono-label text-xs text-ink-faint">Play to</div>
        <div className="mt-2 flex gap-2">
          {TARGET_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setTarget(option)}
              className={`flex-1 rounded-xl border-2 px-3 py-2 text-sm font-medium transition-all active:scale-95 ${
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

      <div className="fade-up flex w-full max-w-xs flex-col gap-2" style={{ animationDelay: '320ms' }}>
        <button
          type="button"
          onClick={() => onStart(target)}
          className="font-display w-full rounded-2xl bg-accent px-4 py-3 font-medium text-white transition-all hover:-translate-y-0.5 hover:opacity-90 hover:shadow-lg active:translate-y-0 active:scale-95"
        >
          Start game
        </button>
        <button
          type="button"
          onClick={() => setShowRules(true)}
          className="font-display w-full rounded-2xl border-2 border-hairline px-4 py-2.5 font-medium text-ink transition-all hover:-translate-y-0.5 hover:bg-surface-sunken active:translate-y-0 active:scale-95"
        >
          How to play
        </button>
      </div>

      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
    </div>
  );
}
