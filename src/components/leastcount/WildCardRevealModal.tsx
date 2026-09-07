'use client';

import { useState } from 'react';
import type { Rank } from '@/lib/leastCount/types';
import Modal from './Modal';

// Explains the round's wild card before play can continue, whenever it
// changes (including the very first round). Adjusts state during render to
// detect the change, per https://react.dev/learn/you-might-not-need-an-effect
// — no timer, since this stays up until the player presses Continue.
export default function WildCardRevealModal({ jokerRank }: { jokerRank: Rank }) {
  const [seenRank, setSeenRank] = useState(jokerRank);
  const [dismissed, setDismissed] = useState(false);

  if (seenRank !== jokerRank) {
    setSeenRank(jokerRank);
    setDismissed(false);
  }

  if (dismissed) return null;

  return (
    <Modal>
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="mono-label rounded-full bg-wild px-4 py-1.5 text-[11px] font-bold text-white shadow-[0_2px_0_var(--wild-shadow)]">
          New round
        </span>
        <div className="flex h-24 w-24 items-center justify-center rounded-[28px] border-4 border-surface bg-wild font-mono text-5xl font-extrabold text-white shadow-[0_6px_0_var(--wild-shadow)]">
          {jokerRank}
        </div>
        <div>
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink">This round&apos;s wild card</h2>
          <p className="mt-1.5 max-w-[280px] text-sm leading-relaxed text-ink-muted">
            Every <strong className="text-wild">{jokerRank}</strong> is worth{' '}
            <strong className="text-wild">0 points</strong> this round — for everyone at the table.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="mt-5 w-full rounded-2xl bg-wild px-4 py-[18px] text-center font-bold text-lg text-white shadow-[0_5px_0_var(--wild-shadow)] transition-transform active:translate-y-[3px] active:shadow-[0_2px_0_var(--wild-shadow)]"
      >
        Continue
      </button>
    </Modal>
  );
}
