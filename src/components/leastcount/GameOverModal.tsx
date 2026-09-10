'use client';

import { useRouter } from 'next/navigation';
import type { GameState, PlayerId } from '@/lib/leastCount/types';
import Confetti from './Confetti';
import Modal from './Modal';

export default function GameOverModal({
  state,
  playerName,
  computerName,
  onPlayAgain,
}: {
  state: GameState;
  playerName: string;
  computerName: string;
  onPlayAgain: () => void;
}) {
  const router = useRouter();
  const won = state.winner === 'player';
  const names: Record<PlayerId, string> = { player: playerName, computer: computerName };
  const ranked: PlayerId[] = (['player', 'computer'] as PlayerId[]).sort((a, b) => state.scores[a] - state.scores[b]);
  const lastCall = state.lastRoundResult;

  return (
    <>
      {won && <Confetti />}
      <Modal>
        <div className="flex flex-col items-center gap-2 text-center">
          {won && (
            <span className="call-pop text-6xl" aria-hidden>
              🏆
            </span>
          )}
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink">
            {won ? 'Congratulations, Winner!' : 'Better luck next time'}
          </h2>
          {lastCall && (
            <p className="text-sm text-ink-muted">
              {names[lastCall.caller]} called Least Count{lastCall.correct ? ' and got it right.' : ' — but was wrong.'}
            </p>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-1.5">
          {ranked.map((id) => (
            <div
              key={id}
              className={`flex items-center justify-between rounded-xl px-3.5 py-2 text-sm ${
                id === state.winner ? 'bg-accent/10' : ''
              }`}
            >
              <span className={id === state.winner ? 'font-bold text-accent' : 'text-ink-muted'}>{names[id]}</span>
              <span className="font-display font-bold text-ink">{state.scores[id]}</span>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-3">
          <button
            type="button"
            onClick={onPlayAgain}
            className="w-full rounded-2xl bg-accent px-4 py-[18px] text-center font-bold text-lg text-white shadow-[0_5px_0_var(--accent-shadow)] transition-transform active:translate-y-[3px] active:shadow-[0_2px_0_var(--accent-shadow)]"
          >
            Play again
          </button>
          <button
            type="button"
            onClick={() => router.push('/')}
            className="w-full rounded-2xl border-2 border-hairline-strong px-4 py-4 text-center font-semibold text-lg text-ink transition-colors hover:bg-surface-sunken"
          >
            Return to menu
          </button>
        </div>
      </Modal>
    </>
  );
}
