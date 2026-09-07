import type { MPGameState } from '@/lib/multiplayer/types';

export default function MPScoreboard({ state }: { state: MPGameState }) {
  return (
    <div className="rounded-xl border border-hairline bg-surface px-4 py-3">
      <div className="mono-label mb-2 text-center text-xs text-ink-faint">
        Target {state.target} &middot; Round {state.roundNumber}
      </div>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
        {state.seats.map((seat) => (
          <div key={seat} className="flex items-center gap-1.5 text-sm">
            {state.turn === seat && <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />}
            <span className="text-ink-muted">{state.names[seat]}</span>
            <span className="font-semibold text-ink">{state.scores[seat]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
