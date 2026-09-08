import { AnimatePresence, motion } from 'framer-motion';
import type { GameState } from '@/lib/leastCount/types';

export default function Scoreboard({ state }: { state: GameState }) {
  const computerThinking = state.turn === 'computer' && state.phase === 'awaiting-action';

  return (
    <div className="flex items-center justify-between gap-3 rounded-[20px] border border-hairline bg-surface-sunken px-[18px] py-3.5">
      <ScoreBlock label="You" score={state.scores.player} active={state.turn === 'player'} />
      <div className="mono-label flex flex-col items-center gap-1 text-center text-[11px] leading-tight text-ink-muted">
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
        className="mono-label flex items-center gap-1.5 text-[11px] text-ink-muted"
        style={{ justifyContent: align === 'right' ? 'flex-end' : 'flex-start' }}
      >
        {align === 'right' && active && <ActiveDot />}
        {label}
        {align === 'left' && active && <ActiveDot />}
      </div>
      <div className="flex items-center gap-1.5" style={{ justifyContent: align === 'right' ? 'flex-end' : 'flex-start' }}>
        <div className="font-display text-[30px] font-bold leading-none text-ink">{score}</div>
        <AnimatePresence>{thinking && <ThinkingDots />}</AnimatePresence>
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

function ThinkingDots() {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.6 }}
      className="mb-1 flex items-end gap-0.5"
      aria-label="Computer is thinking"
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-accent"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
        />
      ))}
    </motion.span>
  );
}
