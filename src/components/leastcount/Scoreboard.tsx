import type { GameState } from '@/lib/leastCount/types';

export default function Scoreboard({ state }: { state: GameState }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[20px] border border-hairline bg-surface-sunken px-[18px] py-3.5">
      <ScoreBlock label="You" score={state.scores.player} active={state.turn === 'player'} />
      <div className="mono-label text-center text-[11px] leading-relaxed text-ink-muted">
        <div>Round {state.roundNumber}</div>
        <div className="text-ink-soft">Target {state.target}</div>
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
      <div
        className="mono-label flex items-center gap-1.5 text-[11px] text-ink-muted"
        style={{ justifyContent: align === 'right' ? 'flex-end' : 'flex-start' }}
      >
        {align === 'right' && active && <ActiveDot />}
        {label}
        {align === 'left' && active && <ActiveDot />}
      </div>
      <div className="font-display text-[30px] font-bold leading-none text-ink">{score}</div>
    </div>
  );
}

function ActiveDot() {
  return <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />;
}
