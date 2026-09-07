import type { GameState } from '@/lib/leastCount/types';
import Modal from './Modal';

export default function GameOverModal({
  state,
  onPlayAgain,
  onChangeTarget,
}: {
  state: GameState;
  onPlayAgain: () => void;
  onChangeTarget: () => void;
}) {
  const won = state.winner === 'player';

  return (
    <Modal>
      <h2 className="font-display text-xl font-semibold text-ink">{won ? 'You win!' : 'Computer wins.'}</h2>
      <p className="mt-1 text-sm text-ink-muted">
        Final score — You: {state.scores.player} &middot; Computer: {state.scores.computer}
      </p>
      <div className="mt-5 flex flex-col gap-2">
        <button
          type="button"
          onClick={onPlayAgain}
          className="w-full rounded-lg bg-accent px-4 py-2.5 font-medium text-white transition-opacity hover:opacity-90"
        >
          Play again
        </button>
        <button
          type="button"
          onClick={onChangeTarget}
          className="w-full rounded-lg border border-hairline px-4 py-2.5 font-medium text-ink transition-colors hover:bg-surface-sunken"
        >
          Change target score
        </button>
      </div>
    </Modal>
  );
}
