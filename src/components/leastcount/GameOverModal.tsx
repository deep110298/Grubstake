'use client';

import { useRouter } from 'next/navigation';
import type { GameState } from '@/lib/leastCount/types';
import Confetti from './Confetti';
import Modal from './Modal';

export default function GameOverModal({
  state,
  playerName,
  onPlayAgain,
}: {
  state: GameState;
  playerName: string;
  onPlayAgain: () => void;
}) {
  const router = useRouter();
  const won = state.winner === 'player';

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
          <p className="text-sm text-ink-muted">
            Final score — {playerName}: {state.scores.player} &middot; Computer: {state.scores.computer}
          </p>
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
