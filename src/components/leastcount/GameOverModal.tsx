import type { GameState } from '@/lib/leastCount/types';
import Modal from './Modal';

export default function GameOverModal({
  state,
  playerName,
  onPlayAgain,
  onChangeTarget,
}: {
  state: GameState;
  playerName: string;
  onPlayAgain: () => void;
  onChangeTarget: () => void;
}) {
  const won = state.winner === 'player';

  return (
    <Modal>
      <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink">
        {won ? 'You win!' : 'Computer wins.'}
      </h2>
      <p className="mt-1 text-sm text-ink-muted">
        Final score — {playerName}: {state.scores.player} &middot; Computer: {state.scores.computer}
      </p>
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
          onClick={onChangeTarget}
          className="w-full rounded-2xl border-2 border-hairline-strong px-4 py-4 text-center font-semibold text-lg text-ink transition-colors hover:bg-surface-sunken"
        >
          Change limit
        </button>
      </div>
    </Modal>
  );
}
