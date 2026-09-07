import Modal from '@/components/leastcount/Modal';
import type { MPGameState } from '@/lib/multiplayer/types';

export default function MPGameOverModal({
  state,
  isHost,
  onPlayAgain,
  onLeave,
}: {
  state: MPGameState;
  isHost: boolean;
  onPlayAgain: () => void;
  onLeave: () => void;
}) {
  const winnerName = state.winner ? state.names[state.winner] : null;
  const ranked = [...state.seats].sort((a, b) => state.scores[a] - state.scores[b]);

  return (
    <Modal>
      <h2 className="font-display text-xl font-semibold text-ink">{winnerName ? `${winnerName} wins!` : 'Game over'}</h2>
      <div className="mt-3 space-y-1">
        {ranked.map((seat) => (
          <div key={seat} className="flex items-center justify-between text-sm">
            <span className={seat === state.winner ? 'font-semibold text-ink' : 'text-ink-muted'}>
              {state.names[seat]}
            </span>
            <span className="font-semibold text-ink">{state.scores[seat]}</span>
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-col gap-2">
        {isHost && (
          <button
            type="button"
            onClick={onPlayAgain}
            className="w-full rounded-lg bg-accent px-4 py-2.5 font-medium text-white transition-opacity hover:opacity-90"
          >
            Play again
          </button>
        )}
        <button
          type="button"
          onClick={onLeave}
          className="w-full rounded-lg border border-hairline px-4 py-2.5 font-medium text-ink transition-colors hover:bg-surface-sunken"
        >
          Leave room
        </button>
      </div>
    </Modal>
  );
}
