import type { GameState, RoundResult } from '@/lib/leastCount/types';
import Modal from './Modal';
import PlayingCard from './PlayingCard';

export default function RoundEndModal({
  state,
  result,
  playerName,
  onContinue,
}: {
  state: GameState;
  result: RoundResult;
  playerName: string;
  onContinue: () => void;
}) {
  const callerLabel = result.caller === 'player' ? playerName : 'Computer';

  return (
    <Modal>
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="mono-label rounded-full border border-accent/40 bg-accent/[0.14] px-4 py-1.5 text-[11px] text-accent">
          Round {state.roundNumber} · {callerLabel} called
        </span>
        <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink">
          {result.correct ? 'Good call.' : 'Wrong call.'}
        </h2>
        <p className="max-w-[270px] text-sm leading-relaxed text-ink-muted">
          {result.correct
            ? `${callerLabel} had the lowest hand and scores nothing this round.`
            : `${callerLabel} didn't have the lowest hand and takes the penalty.`}
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        <HandSummary
          label={playerName}
          cards={result.hands.player}
          jokerRank={result.jokerRank}
          value={result.values.player}
          points={result.pointsAwarded.player}
          highlighted={result.caller === 'player'}
        />
        <HandSummary
          label="Computer"
          cards={result.hands.computer}
          jokerRank={result.jokerRank}
          value={result.values.computer}
          points={result.pointsAwarded.computer}
          highlighted={result.caller === 'computer'}
        />
      </div>

      <div className="mt-3 flex items-center justify-between rounded-2xl border border-hairline bg-surface-sunken px-[18px] py-3.5">
        <span className="mono-label text-[11px] text-ink-soft">Running total</span>
        <span className="font-display text-base font-bold text-ink">
          {state.scores.player} <span className="text-ink-muted">·</span> {state.scores.computer}
        </span>
      </div>

      <button
        type="button"
        onClick={onContinue}
        className="mt-4 w-full rounded-2xl bg-accent px-4 py-[18px] text-center font-bold text-lg text-white shadow-[0_5px_0_var(--accent-shadow)] transition-transform active:translate-y-[3px] active:shadow-[0_2px_0_var(--accent-shadow)]"
      >
        Next round
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
  highlighted,
}: {
  label: string;
  cards: RoundResult['hands']['player'];
  jokerRank: RoundResult['jokerRank'];
  value: number;
  points: number;
  highlighted: boolean;
}) {
  return (
    <div
      className={`rounded-[18px] border p-4 ${highlighted ? 'border-accent bg-surface-sunken' : 'border-hairline bg-surface-sunken'}`}
    >
      <div className="flex items-center justify-between">
        <span className={`mono-label text-[11px] ${highlighted ? 'text-accent' : 'text-ink-soft'}`}>
          {label} · {value} pts
        </span>
        <span className={`font-display text-lg font-bold ${points > 0 ? 'text-wild' : 'text-accent'}`}>+{points}</span>
      </div>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {cards.map((card) => (
          <PlayingCard key={card.id} card={card} jokerRank={jokerRank} size="sm" />
        ))}
      </div>
    </div>
  );
}
