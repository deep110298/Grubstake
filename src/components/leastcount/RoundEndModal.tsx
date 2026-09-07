import type { RoundResult } from '@/lib/leastCount/types';
import Modal from './Modal';
import PlayingCard from './PlayingCard';

export default function RoundEndModal({
  result,
  onContinue,
}: {
  result: RoundResult;
  onContinue: () => void;
}) {
  const callerLabel = result.caller === 'player' ? 'You' : 'Computer';

  return (
    <Modal>
      <h2 className="text-lg font-semibold text-ink">
        {result.correct ? `${callerLabel} called it right!` : `${callerLabel} called it wrong.`}
      </h2>
      <p className="mt-1 text-sm text-ink-muted">
        {result.correct
          ? `${callerLabel} had the lowest hand and scores 0 for this round.`
          : `${callerLabel} didn't have the lowest hand and takes a penalty.`}
      </p>

      <div className="mt-4 space-y-3">
        <HandSummary label="Your hand" cards={result.hands.player} jokerRank={result.jokerRank} value={result.values.player} points={result.pointsAwarded.player} />
        <HandSummary label="Computer's hand" cards={result.hands.computer} jokerRank={result.jokerRank} value={result.values.computer} points={result.pointsAwarded.computer} />
      </div>

      <button
        type="button"
        onClick={onContinue}
        className="mt-5 w-full rounded-lg bg-accent px-4 py-2.5 font-medium text-white transition-opacity hover:opacity-90"
      >
        Continue
      </button>
    </Modal>
  );
}

function HandSummary({
  label,
  cards,
  jokerRank,
  value,
  points,
}: {
  label: string;
  cards: RoundResult['hands']['player'];
  jokerRank: RoundResult['jokerRank'];
  value: number;
  points: number;
}) {
  return (
    <div className="rounded-lg border border-hairline bg-surface-sunken p-3">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-ink">{label}</span>
        <span className="text-xs text-ink-muted">
          hand: {value} &middot; <span className="font-semibold text-ink">+{points} pts</span>
        </span>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {cards.map((card) => (
          <PlayingCard key={card.id} card={card} jokerRank={jokerRank} size="sm" />
        ))}
      </div>
    </div>
  );
}
