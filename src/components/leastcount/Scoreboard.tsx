import type { GameState } from '@/lib/leastCount/types';

export default function Scoreboard({ state }: { state: GameState }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-hairline bg-surface px-4 py-3">
      <ScoreBlock label="You" score={state.scores.player} active={state.turn === 'player'} />
      <div className="mono-label text-center text-xs text-ink-faint">
        <div>Target {state.target}</div>
        <div className="mt-1 text-ink-muted">Round {state.roundNumber}</div>
      </div>
      <ScoreBlock label="Computer" score={state.scores.computer} active={state.turn === 'computer'} align="right" />
    </div>
  );
}

function ScoreBlock({
  label,
  score,
  active,
  align = 'left',
}: {
  label: string;
  score: number;
  active: boolean;
  align?: 'left' | 'right';
}) {
  return (
    <div className={align === 'right' ? 'text-right' : 'text-left'}>
      <div className="mono-label flex items-center gap-1.5 text-xs text-ink-faint" style={{ justifyContent: align === 'right' ? 'flex-end' : 'flex-start' }}>
        {align === 'right' && active && <ActiveDot />}
        {label}
        {align === 'left' && active && <ActiveDot />}
      </div>
      <div className="text-2xl font-semibold text-ink">{score}</div>
    </div>
  );
}

function ActiveDot() {
  return <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />;
}
