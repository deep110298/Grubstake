import type { MPGameState } from '@/lib/multiplayer/types';

const AVATAR_COLORS = ['bg-wild text-white', 'bg-hairline text-ink', 'bg-accent text-white'];

export default function MPScoreboard({ state }: { state: MPGameState }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {state.seats.map((seat, i) => {
        const isOut = state.eliminated.includes(seat);
        const isTurn = state.turn === seat && !isOut;
        return (
          <div
            key={seat}
            className={`flex items-center justify-between gap-2 rounded-[14px] border px-3 py-2.5 ${
              isTurn ? 'border-accent bg-surface-sunken shadow-[0_0_0_3px_rgba(10,111,120,0.15)]' : 'border-hairline bg-surface-sunken'
            } ${isOut ? 'opacity-55' : ''}`}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <div
                className={`flex h-6.5 w-6.5 flex-none items-center justify-center rounded-[9px] font-display text-xs font-bold ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}
              >
                {state.names[seat].slice(0, 1).toUpperCase()}
              </div>
              <div className="truncate text-sm font-semibold text-ink">{state.names[seat]}</div>
            </div>
            {isOut ? (
              <span className="mono-label text-[9px] text-ink-muted">out</span>
            ) : isTurn ? (
              <span className="pulse-dot mono-label text-[9px] text-accent">turn</span>
            ) : (
              <span className="font-display text-[15px] font-bold text-ink-muted">{state.scores[seat]}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
