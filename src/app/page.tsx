import type { CSSProperties } from 'react';
import Link from 'next/link';
import PlayingCard from '@/components/leastcount/PlayingCard';

const HERO_CARDS = [
  { id: 'hero-a', suit: 'spades', rank: 'A', tilt: '-12deg', lift: '10px', delay: '0ms', floatDelay: '0s' },
  { id: 'hero-k', suit: 'hearts', rank: 'K', tilt: '0deg', lift: '-6px', delay: '120ms', floatDelay: '0.3s' },
  { id: 'hero-7', suit: 'clubs', rank: '7', tilt: '12deg', lift: '10px', delay: '240ms', floatDelay: '0.6s' },
] as const;

export default function Home() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center gap-10 overflow-hidden bg-canvas px-4 py-10 text-center">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2 rounded-full bg-accent-tint opacity-70 blur-3xl" />
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
        <h1 className="fade-up font-display text-4xl font-semibold tracking-tight text-ink" style={{ animationDelay: '260ms' }}>
          Least Count App
        </h1>
        <p className="fade-up mt-2 max-w-xs text-sm text-ink-muted" style={{ animationDelay: '360ms' }}>
          Lowest hand wins — draw, discard, and call it before anyone else does.
        </p>
      </div>

      <div className="fade-up flex w-full max-w-xs flex-col gap-2" style={{ animationDelay: '460ms' }}>
        <Link
          href="/play/computer"
          className="font-display w-full rounded-2xl bg-accent px-4 py-3 font-medium text-white transition-all hover:-translate-y-0.5 hover:opacity-90 hover:shadow-lg active:translate-y-0 active:scale-95"
        >
          Play vs Computer
        </Link>
        <Link
          href="/play/friends"
          className="font-display w-full rounded-2xl border-2 border-hairline px-4 py-2.5 font-medium text-ink transition-all hover:-translate-y-0.5 hover:bg-surface-sunken active:translate-y-0 active:scale-95"
        >
          Play with Friends
        </Link>
      </div>
    </div>
  );
}
