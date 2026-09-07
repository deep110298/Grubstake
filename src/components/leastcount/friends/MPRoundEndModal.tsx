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
      <h2 className="text-lg font-semibold text-ink">
        {result.correct ? `${callerName} called it right!` : `${callerName} called it wrong.`}
      </h2>
      <p className="mt-1 text-sm text-ink-muted">
        {result.correct
          ? `${callerName} had the lowest hand and scores 0 for this round.`
          : `${callerName} didn't have the lowest hand and takes a penalty.`}
      </p>

      <div className="mt-4 space-y-3">
        {result.participants.map((seat) => {
          const justEliminated = state.eliminated.includes(seat);
          return (
            <div key={seat} className="rounded-lg border border-hairline bg-surface-sunken p-3">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium text-ink">
                  {state.names[seat]}
                  {justEliminated && <span className="mono-label ml-1.5 text-[10px] text-error">OUT</span>}
                </span>
                <span className="text-xs text-ink-muted">
                  hand: {result.values[seat]} &middot;{' '}
                  <span className="font-semibold text-ink">+{result.pointsAwarded[seat]} pts</span>
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
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
          className="mt-5 w-full rounded-lg bg-accent px-4 py-2.5 font-medium text-white transition-opacity hover:opacity-90"
        >
          Continue
        </button>
      ) : (
        <p className="mt-5 text-sm text-ink-muted">Waiting for the host to continue…</p>
      )}
    </Modal>
  );
}
