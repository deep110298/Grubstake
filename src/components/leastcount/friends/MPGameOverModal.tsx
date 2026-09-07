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
      <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink">
        {winnerName ? `${winnerName} wins!` : 'Game over'}
      </h2>
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
        {isHost && (
          <button
            type="button"
            onClick={onPlayAgain}
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
