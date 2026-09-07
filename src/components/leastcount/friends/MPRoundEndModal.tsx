import Modal from '@/components/leastcount/Modal';
import PlayingCard from '@/components/leastcount/PlayingCard';
import type { MPGameState, MPRoundResult } from '@/lib/multiplayer/types';

export default function MPRoundEndModal({
  state,
  result,
  onContinue,
  isHost,
}: {
  state: MPGameState;
  result: MPRoundResult;
  onContinue: () => void;
  isHost: boolean;
}) {
  const callerName = state.names[result.caller];

  return (
    <Modal>
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="mono-label rounded-full border border-accent/40 bg-accent/[0.14] px-4 py-1.5 text-[11px] text-accent">
          Round {state.roundNumber} · {callerName} called
        </span>
        <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink">
          {result.correct ? 'Good call.' : 'Wrong call.'}
        </h2>
        <p className="max-w-[270px] text-sm leading-relaxed text-ink-muted">
          {result.correct
            ? `${callerName} had the lowest hand and scores nothing this round.`
            : `${callerName} didn't have the lowest hand and takes the penalty.`}
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        {result.participants.map((seat) => {
          const justEliminated = state.eliminated.includes(seat);
          const highlighted = seat === result.caller;
          return (
            <div
              key={seat}
              className={`rounded-[18px] border p-4 ${highlighted ? 'border-accent bg-surface-sunken' : 'border-hairline bg-surface-sunken'}`}
            >
              <div className="flex items-center justify-between">
                <span className={`mono-label text-[11px] ${highlighted ? 'text-accent' : 'text-ink-muted'}`}>
                  {state.names[seat]} · {result.values[seat]} pts
                  {justEliminated && <span className="ml-1.5 text-wild">OUT</span>}
                </span>
                <span
                  className={`font-display text-lg font-bold ${result.pointsAwarded[seat] > 0 ? 'text-wild' : 'text-accent'}`}
                >
                  +{result.pointsAwarded[seat]}
                </span>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {result.hands[seat].map((card) => (
                  <PlayingCard key={card.id} card={card} jokerRank={result.jokerRank} size="sm" />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {isHost ? (
        <button
          type="button"
          onClick={onContinue}
          className="mt-5 w-full rounded-2xl bg-accent px-4 py-[18px] text-center font-bold text-lg text-white shadow-[0_5px_0_var(--accent-shadow)] transition-transform active:translate-y-[3px] active:shadow-[0_2px_0_var(--accent-shadow)]"
        >
          Next round
        </button>
      ) : (
        <p className="mt-5 text-center text-sm text-ink-muted">Waiting for the host to continue…</p>
      )}
    </Modal>
  );
}
