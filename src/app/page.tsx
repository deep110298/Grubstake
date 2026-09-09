'use client';

import type { CSSProperties } from 'react';
import { useState } from 'react';
import Link from 'next/link';
import DailyChallengeCard from '@/components/leastcount/DailyChallengeCard';
import PlayingCard from '@/components/leastcount/PlayingCard';
import RulesModal from '@/components/leastcount/RulesModal';
import StoryModeCard from '@/components/leastcount/StoryModeCard';

const HERO_CARDS = [
  { id: 'hero-a', suit: 'spades', rank: 'A', tilt: '-12deg', lift: '10px', delay: '0ms', floatDelay: '0s' },
  { id: 'hero-k', suit: 'hearts', rank: 'K', tilt: '0deg', lift: '-6px', delay: '120ms', floatDelay: '0.3s' },
  { id: 'hero-7', suit: 'clubs', rank: '7', tilt: '12deg', lift: '10px', delay: '240ms', floatDelay: '0.6s' },
] as const;

export default function Home() {
  const [showRules, setShowRules] = useState(false);

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center gap-10 overflow-hidden bg-canvas px-4 py-10 text-center">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/10 opacity-70 blur-3xl" />
      </div>

      <div className="flex justify-center -space-x-6">
        {HERO_CARDS.map((card) => (
          <div
            key={card.id}
            className={`hero-card ${card.rank === 'K' ? 'z-10' : ''}`}
            style={{ '--card-tilt': card.tilt, '--card-lift': card.lift, animationDelay: card.delay } as CSSProperties}
          >
            <div className="hero-card-inner" style={{ '--float-delay': card.floatDelay } as CSSProperties}>
              <PlayingCard
                card={{ id: card.id, suit: card.suit, rank: card.rank }}
                jokerRank={card.rank === 'A' ? 'A' : undefined}
                size="lg"
              />
            </div>
          </div>
        ))}
      </div>

      <div>
        <h1
          className="fade-up font-display text-[42px] font-extrabold leading-none tracking-tight text-ink"
          style={{ animationDelay: '260ms' }}
        >
          LEAST
          <br />
          COUNT
        </h1>
        <p
          className="fade-up mx-auto mt-3 max-w-[260px] text-[15px] leading-relaxed text-ink-muted"
          style={{ animationDelay: '360ms' }}
        >
          Keep your hand low, call when you think you&apos;re lowest, and beat the table.
        </p>
      </div>

      <div className="fade-up flex w-full max-w-xs flex-col gap-3" style={{ animationDelay: '460ms' }}>
        <DailyChallengeCard />
        <StoryModeCard />
        <Link
          href="/play/computer"
          className="rounded-[18px] bg-accent px-4 py-[18px] text-center font-bold text-lg text-white shadow-[0_5px_0_var(--accent-shadow)] transition-transform active:translate-y-[3px] active:shadow-[0_2px_0_var(--accent-shadow)]"
        >
          Play now
        </Link>
        <Link
          href="/play/friends"
          className="rounded-[18px] border-2 border-hairline-strong px-4 py-4 text-center font-semibold text-lg text-ink transition-colors hover:bg-surface-sunken"
        >
          Play with Friends
        </Link>
        <button
          type="button"
          onClick={() => setShowRules(true)}
          className="mono-label pt-1.5 text-xs text-ink-soft hover:text-ink"
        >
          How to play
        </button>
      </div>

      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
    </div>
  );
}
