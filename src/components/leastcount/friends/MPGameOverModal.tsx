'use client';

import { useState } from 'react';
import Confetti from '@/components/leastcount/Confetti';
import Modal from '@/components/leastcount/Modal';
import type { MPGameState } from '@/lib/multiplayer/types';

export default function MPGameOverModal({
  state,
  myPlayerId,
  isHost,
  onPlayAgain,
  onLeave,
}: {
  state: MPGameState;
  myPlayerId: string;
  isHost: boolean;
  onPlayAgain: () => void;
  onLeave: () => void;
}) {
  const [showStandings, setShowStandings] = useState(false);
  const [readyForNext, setReadyForNext] = useState(false);
  const winnerName = state.winner ? state.names[state.winner] : null;
  const iWon = state.winner === myPlayerId;
  const ranked = [...state.seats].sort((a, b) => state.scores[a] - state.scores[b]);

  if (!showStandings) {
    return (
      <>
        {iWon && <Confetti />}
        <Modal>
          {iWon ? (
            <div className="flex flex-col items-center gap-2 text-center">
              <span className="call-pop text-6xl" aria-hidden>
                🏆
              </span>
              <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink">Congratulations, Winner!</h2>
              <p className="text-sm text-ink-muted">You had the lowest score and take the game.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-center">
              <span className="call-pop text-6xl" aria-hidden>
                🥲
              </span>
              <span className="mono-label rounded-full bg-hairline px-4 py-1.5 text-[11px] font-bold text-ink-soft">
                NOT THIS TIME
              </span>
              <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink">So close!</h2>
              {winnerName && <p className="text-sm text-ink-muted">{winnerName} takes the win — good game.</p>}
            </div>
          )}
          <button
            type="button"
            onClick={() => setShowStandings(true)}
            className="mt-5 w-full rounded-2xl bg-accent px-4 py-[18px] text-center font-bold text-lg text-white shadow-[0_5px_0_var(--accent-shadow)] transition-transform active:translate-y-[3px] active:shadow-[0_2px_0_var(--accent-shadow)]"
          >
            Continue
          </button>
        </Modal>
      </>
    );
  }

  return (
    <Modal>
      <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink">Final standings</h2>
      <div className="mt-4 flex flex-col gap-1.5">
        {ranked.map((seat) => (
          <div
            key={seat}
            className={`flex items-center justify-between rounded-xl px-3.5 py-2 text-sm ${
              seat === state.winner ? 'bg-accent/10' : ''
            }`}
          >
            <span className={seat === state.winner ? 'font-bold text-accent' : 'text-ink-muted'}>
              {state.names[seat]}
            </span>
            <span className="font-display font-bold text-ink">{state.scores[seat]}</span>
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-col gap-3">
        {isHost ? (
          <button
            type="button"
            onClick={onPlayAgain}
            className="w-full rounded-2xl bg-accent px-4 py-[18px] text-center font-bold text-lg text-white shadow-[0_5px_0_var(--accent-shadow)] transition-transform active:translate-y-[3px] active:shadow-[0_2px_0_var(--accent-shadow)]"
          >
            Start game
          </button>
        ) : readyForNext ? (
          <p className="text-center text-sm text-ink-muted">Waiting for the host to start a new game…</p>
        ) : (
          <button
            type="button"
            onClick={() => setReadyForNext(true)}
            className="w-full rounded-2xl bg-accent px-4 py-[18px] text-center font-bold text-lg text-white shadow-[0_5px_0_var(--accent-shadow)] transition-transform active:translate-y-[3px] active:shadow-[0_2px_0_var(--accent-shadow)]"
          >
            Play again
          </button>
        )}
        <button
          type="button"
          onClick={onLeave}
          className="w-full rounded-2xl border-2 border-hairline-strong px-4 py-4 text-center font-semibold text-lg text-ink transition-colors hover:bg-surface-sunken"
        >
          Leave room
        </button>
      </div>
    </Modal>
  );
}
