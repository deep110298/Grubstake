'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { dailyComputerName, todayKey } from '@/lib/leastCount/dailyChallenge';
import { getEffectiveStreak, getLast7Days, getLastResult, hasPlayedToday, type DailyOutcome } from '@/lib/leastCount/dailyStreak';

interface DailyStatus {
  rival: string;
  alreadyPlayed: boolean;
  todayResult: DailyOutcome | null;
  streak: number;
  last7Days: { dateKey: string; result: DailyOutcome | null; isToday: boolean }[];
}

// Depends on the player's local clock and localStorage — built client-side
// only, after mount, so it can't disagree with a server render in a
// different timezone (see DailyChallengeBoard for the same reasoning).
function buildStatus(): DailyStatus {
  const dateKey = todayKey();
  return {
    rival: dailyComputerName(dateKey),
    alreadyPlayed: hasPlayedToday(dateKey),
    todayResult: getLastResult(dateKey)?.result ?? null,
    streak: getEffectiveStreak(dateKey),
    last7Days: getLast7Days(dateKey),
  };
}

export default function DailyChallengeCard() {
  const [status, setStatus] = useState<DailyStatus | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setStatus(buildStatus()), 0);
    return () => clearTimeout(timer);
  }, []);

  // Nothing to show for the first frame — this pops in a beat after the
  // rest of the page, same as the saved-name pattern used elsewhere.
  if (!status) return null;

  return (
    <Link
      href="/play/daily"
      className="block rounded-[18px] border-[1.5px] border-ember p-3.5 text-left transition-transform active:scale-[0.98]"
      style={{ background: 'linear-gradient(155deg, var(--ember-soft), var(--surface) 65%)' }}
    >
      <div className="flex items-center justify-between">
        <span className="mono-label flex items-center gap-1.5 text-[10px] text-ember-shadow">
          <span aria-hidden>🔥</span> Daily challenge
        </span>
        {status.streak > 0 && (
          <span className="mono-label text-[10px] font-bold text-ember">
            {status.streak} day streak
          </span>
        )}
      </div>

      <div className="mt-2 font-display text-[15px] font-extrabold text-ink">
        {status.alreadyPlayed ? "See today's result" : `Play today's challenge`}
      </div>
      <div className="mt-0.5 text-xs text-ink-muted">
        {status.alreadyPlayed
          ? status.todayResult === 'win'
            ? `You beat ${status.rival} today!`
            : `Lost to ${status.rival} today — try again tomorrow.`
          : `Today's rival: ${status.rival}`}
      </div>

      <div className="mt-2.5 flex gap-1.5">
        {status.last7Days.map((day) => (
          <span
            key={day.dateKey}
            className={`flex h-4 w-4 items-center justify-center rounded-full text-[8px] ${
              day.result === 'win'
                ? 'bg-ember text-white'
                : day.result === 'loss'
                  ? 'border border-hairline-strong bg-surface-sunken-alt text-ink-faint'
                  : day.isToday
                    ? 'border-[1.5px] border-dashed border-ember text-ember'
                    : 'bg-surface-sunken-alt text-ink-faint'
            }`}
          >
            {day.result === 'win' ? '✓' : ''}
          </span>
        ))}
      </div>
    </Link>
  );
}
