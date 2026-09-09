import { AnimatePresence, motion } from 'framer-motion';
import type { GameState } from '@/lib/leastCount/types';
import ThinkingDots from './ThinkingDots';

export default function Scoreboard({ state, playerName }: { state: GameState; playerName: string }) {
  const computerThinking = state.turn === 'computer' && state.phase === 'awaiting-action';

  return (
    <div className="flex items-center justify-between gap-3 rounded-[20px] border border-hairline bg-surface-sunken px-[18px] py-3.5">
      <ScoreBlock label={playerName} score={state.scores.player} active={state.turn === 'player'} />
      <div className="mono-label flex flex-col items-center gap-1 text-center text-[11px] leading-tight text-ink-soft">
        <div>Round {state.roundNumber}</div>
        <div className="text-ink-soft">Limit {state.target}</div>
        <div className="mt-0.5 rounded-full bg-wild px-3 py-1 text-[11px] font-bold text-white shadow-[0_2px_0_var(--wild-shadow)]">
          WILD · {state.jokerRank}
        </div>
      </div>
      <ScoreBlock
        label="Computer"
        score={state.scores.computer}
        active={state.turn === 'computer'}
        thinking={computerThinking}
        align="right"
      />
    </div>
  );
}

function ScoreBlock({
  label,
  score,
  active,
  thinking,
  align = 'left',
}: {
  label: string;
  score: number;
  active: boolean;
  thinking?: boolean;
  align?: 'left' | 'right';
}) {
  return (
    <div className={align === 'right' ? 'text-right' : 'text-left'}>
      <div
        className="mono-label flex items-center gap-1.5 text-[11px] text-ink-soft"
        style={{ justifyContent: align === 'right' ? 'flex-end' : 'flex-start' }}
      >
        {align === 'right' && active && <ActiveDot />}
        <span className="max-w-[90px] truncate">{label}</span>
        {align === 'left' && active && <ActiveDot />}
      </div>
      <div className="flex items-center gap-1.5" style={{ justifyContent: align === 'right' ? 'flex-end' : 'flex-start' }}>
        <div className="font-display text-[30px] font-bold leading-none text-ink">{score}</div>
        <AnimatePresence>{thinking && <ThinkingDots label="Computer is thinking" className="mb-1" />}</AnimatePresence>
      </div>
    </div>
  );
}

function ActiveDot() {
  return (
    <motion.span
      layoutId="active-turn-dot"
      transition={{ type: 'spring', stiffness: 500, damping: 32 }}
      className="pulse-dot h-1.5 w-1.5 rounded-full bg-accent"
      aria-hidden
    />
  );
}

