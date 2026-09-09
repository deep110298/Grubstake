'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { recordDailyResult, type DailyOutcome } from '@/lib/leastCount/dailyStreak';
import Confetti from './Confetti';
import Modal from './Modal';

const SITE_URL = 'https://leastcountapp.com';

function buildShareText(won: boolean, day: number, streak: number, rival: string, rounds: number): string {
  const line1 = won ? `Least Count — Day ${day} 🔥${streak}` : `Least Count — Day ${day}`;
  const line2 = won ? `Beat ${rival} in ${rounds} round${rounds === 1 ? '' : 's'}` : `Lost to ${rival}`;
  return `${line1}\n${line2}\n${SITE_URL}`;
}

export default function DailyResultModal({
  dateKey,
  day,
  rival,
  rounds,
  result,
}: {
  dateKey: string;
  day: number;
  rival: string;
  rounds: number;
  result: DailyOutcome;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  // Idempotent per date: on a fresh finish this records the result; on a
  // revisit later the same day it just returns what was already recorded.
  const [{ streak }] = useState(() => recordDailyResult({ dateKey, rival, rounds, result }));
  const won = result === 'win';
  const text = buildShareText(won, day, streak, rival, rounds);

  function shareToX() {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  }

  function shareToFacebook() {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SITE_URL)}`,
      '_blank',
      'noopener,noreferrer'
    );
  }

  async function shareToInstagram() {
    // Instagram has no web share-intent URL — hand off to the OS share sheet
    // where one exists (it lists Instagram alongside everything else);
    // otherwise fall back to copying the text so it can be pasted in.
    const nav = navigator as Navigator & { share?: (data: ShareData) => Promise<void> };
    if (nav.share) {
      try {
        await nav.share({ text, url: SITE_URL });
        return;
      } catch {
        // user cancelled the share sheet — fall through to clipboard copy
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard can be unavailable — not critical
    }
  }

  return (
    <>
      {won && <Confetti />}
      <Modal>
        <div className="flex flex-col items-center gap-1.5 text-center">
          {won ? (
            <span className="call-pop text-6xl" aria-hidden>
              🏆
            </span>
          ) : (
            <span className="call-pop text-6xl" style={{ filter: 'grayscale(1)', opacity: 0.55 }} aria-hidden>
              🔥
            </span>
          )}
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink">
            {won ? `You beat ${rival}!` : 'So close — try again tomorrow'}
          </h2>
          <div className="mt-1 flex flex-col items-center">
            <span className={`font-display text-3xl font-extrabold leading-none ${won ? 'text-ember' : 'text-ink-faint'}`}>
              {streak}
            </span>
            <span className="mono-label text-[10px] text-ink-muted">Day streak</span>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border-[1.5px] border-hairline bg-surface-sunken p-4 text-center">
          <div className="mb-2 flex items-center justify-center gap-1.5">
            <span className="flex h-4 w-4 items-center justify-center rounded-[5px] bg-accent text-[9px] text-white">♠</span>
            <span className="mono-label text-[9px] text-ink-faint">Least Count</span>
          </div>
          <div className="font-display text-xl font-extrabold text-ink">Day {day}</div>
          <div
            className={`mono-label mt-2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold ${
              won ? 'bg-ember-soft text-ember-shadow' : 'border border-hairline-strong bg-surface-sunken-alt text-ink-faint'
            }`}
          >
            {won ? `🔥 ${streak} day streak` : 'Streak reset'}
          </div>
          <p className="mt-2 text-sm text-ink-soft">{won ? `Beat ${rival} in ${rounds} rounds` : `Lost to ${rival}`}</p>
          <p className="mono-label mt-1.5 text-[8px] text-ink-faint">leastcountapp.com</p>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={shareToFacebook}
            aria-label="Share to Facebook"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1877f2] transition-transform active:scale-90"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="#fff">
              <path d="M15 3h-2.6C10 3 9 4.3 9 6.6V9H6.5v3H9v9h3v-9h2.3l.4-3H12V6.9c0-.8.2-1.3 1.3-1.3H15V3z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={shareToInstagram}
            aria-label="Share to Instagram"
            className="flex h-10 w-10 items-center justify-center rounded-full transition-transform active:scale-90"
            style={{ background: 'linear-gradient(135deg, #f9ce34, #ee2a7b 55%, #6228d7)' }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#fff" strokeWidth="1.8">
              <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
              <circle cx="12" cy="12" r="4.1" />
              <circle cx="17.1" cy="6.9" r="0.9" fill="#fff" stroke="none" />
            </svg>
          </button>
          <button
            type="button"
            onClick={shareToX}
            aria-label="Share to X"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#15131a] transition-transform active:scale-90"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="#fff">
              <path d="M18.9 3H22l-7.2 8.2L23 21h-6.4l-5-6.4-5.7 6.4H2.7l7.7-8.7L2 3h6.6l4.5 5.9L18.9 3zm-1.1 16.2h1.8L7.3 4.7H5.4l12.4 14.5z" />
            </svg>
          </button>
        </div>
        {copied && <p className="mt-2 text-center text-xs text-accent">Copied — paste it in Instagram</p>}

        <div className="mt-5 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="w-full rounded-2xl border-2 border-hairline-strong px-4 py-4 text-center font-semibold text-lg text-ink transition-colors hover:bg-surface-sunken"
          >
            Back to menu
          </button>
        </div>
        {won && <p className="mt-3 text-center text-xs text-ink-faint">Next challenge unlocks at midnight</p>}
      </Modal>
    </>
  );
}
