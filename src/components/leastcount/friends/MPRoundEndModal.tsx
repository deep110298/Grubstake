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
  const ranked = [...state.seats].sort((a, b) => state.scores[a] - state.scores[b]);

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
                <span className={`mono-label text-[11px] ${highlighted ? 'text-accent' : 'text-ink-soft'}`}>
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

      <div className="mt-3 flex flex-col gap-1 rounded-2xl border border-hairline bg-surface-sunken p-3.5">
        <span className="mono-label px-1 pb-0.5 text-[11px] text-ink-soft">Running total</span>
        {ranked.map((seat) => {
          const isOut = state.eliminated.includes(seat);
          return (
            <div key={seat} className={`flex items-center justify-between rounded-xl px-1.5 py-1 ${isOut ? 'opacity-55' : ''}`}>
              <span className="flex items-center gap-1.5 truncate text-sm font-semibold text-ink">
                {state.names[seat]}
                {isOut && <span className="mono-label text-[9px] text-wild">OUT</span>}
              </span>
              <span className="font-display text-base font-bold text-ink">{state.scores[seat]}</span>
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
