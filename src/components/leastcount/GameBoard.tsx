'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { computerTakeTurn } from '@/lib/leastCount/ai';
import { handValue, sortHand } from '@/lib/leastCount/deck';
import {
  call,
  canAct,
  canCall,
  canDrawReplacement,
  canPlayCards,
  DECLARE_THRESHOLD,
  drawReplacement,
  newGame,
  playCards,
  startNextRound,
} from '@/lib/leastCount/engine';
import type { GameState } from '@/lib/leastCount/types';
import CallAnnouncement from './CallAnnouncement';
import GameOverModal from './GameOverModal';
import PauseModal from './PauseModal';
import PlayingCard, { CardBack } from './PlayingCard';
import RoundEndModal from './RoundEndModal';
import RulesModal from './RulesModal';
import Scoreboard from './Scoreboard';
import SetupScreen from './SetupScreen';
import WildCardRevealModal from './WildCardRevealModal';

const DEAL_SPRING = { type: 'spring' as const, stiffness: 320, damping: 26 };
const CALL_REVEAL_DELAY = 2200;

export default function GameBoard() {
  const [state, setState] = useState<GameState | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [showRules, setShowRules] = useState(false);
  const [paused, setPaused] = useState(false);
  const [revealRoundEnd, setRevealRoundEnd] = useState(false);
  const [prevRoundEndKey, setPrevRoundEndKey] = useState<string | null>(null);
  const computerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!state || paused || state.turn !== 'computer' || state.phase !== 'awaiting-action') return;
    computerTimer.current = setTimeout(() => {
      setState((current) => (current ? computerTakeTurn(current) : current));
    }, 800);
    return () => {
      if (computerTimer.current) clearTimeout(computerTimer.current);
    };
  }, [state, paused]);

  // Reset whether the round breakdown has been revealed yet whenever we
  // enter (or leave) the round-end phase — adjusting state during render
  // rather than in an effect, per
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes.
  const roundEndKey = state && state.phase === 'round-end' ? String(state.roundNumber) : null;
  if (roundEndKey !== prevRoundEndKey) {
    setPrevRoundEndKey(roundEndKey);
    setRevealRoundEnd(false);
  }

  // Give a call its moment before the full round breakdown appears.
  useEffect(() => {
    if (!roundEndKey) return;
    const timer = setTimeout(() => setRevealRoundEnd(true), CALL_REVEAL_DELAY);
    return () => clearTimeout(timer);
  }, [roundEndKey]);

  if (!state) {
    return <SetupScreen onStart={(target) => setState(newGame(target))} />;
  }

  const yourTurnToAct = canAct(state, 'player');
  const yourTurnToDraw = canDrawReplacement(state, 'player');
  const canPlaySelected = canPlayCards(state, 'player', selected);
  const canCallNow = canCall(state, 'player');
  const yourHandValue = handValue(state.hands.player, state.jokerRank);
  const discardTop = state.discardPile[state.discardPile.length - 1];

  function handleHandCardClick(cardId: string) {
    if (!yourTurnToAct) return;
    setSelected((current) => {
      if (current.includes(cardId)) return current.filter((id) => id !== cardId);
      const card = state!.hands.player.find((c) => c.id === cardId);
      const first = state!.hands.player.find((c) => c.id === current[0]);
      if (first && card && first.rank !== card.rank) return [cardId];
      return [...current, cardId];
    });
  }

  function statusText(): string {
    if (state!.turn === 'computer') return 'Computer is playing…';
    if (yourTurnToDraw) return 'Doesn’t match — draw a replacement card.';
    if (selected.length > 0) return 'Tap "Play" to discard the selected card(s).';
    if (yourTurnToAct && !canCallNow) {
      return `Choose a card from your hand to play. (You need ${DECLARE_THRESHOLD} or less to call — you have ${yourHandValue}.)`;
    }
    return 'Choose a card from your hand to play, or call Least Count.';
  }

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <WildCardRevealModal jokerRank={state.jokerRank} />
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-3.5 px-4 py-4">
        <Scoreboard state={state} />

        <div className="-mt-2 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setPaused(true)}
            className="mono-label text-[11px] text-ink-muted hover:text-ink"
          >
            Pause
          </button>
          <button
            type="button"
            onClick={() => setShowRules(true)}
            className="mono-label text-[11px] text-ink-muted hover:text-ink"
          >
            Rules
          </button>
        </div>

        <section className="flex flex-col items-center gap-2 pt-1">
          <span className="mono-label text-[11px] text-ink-muted">Computer · {state.hands.computer.length} cards</span>
          <div className="flex gap-1.5" key={state.roundNumber}>
            <AnimatePresence mode="popLayout">
              {state.hands.computer.map((card, i) => (
                <motion.div
                  key={card.id}
                  layout
                  initial={{ opacity: 0, y: 30, scale: 0.7 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -30, scale: 0.6, transition: { duration: 0.2 } }}
                  transition={{ ...DEAL_SPRING, delay: i * 0.06 }}
                >
                  <CardBack size="sm" />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>

        <section
          className="flex flex-1 items-center justify-center gap-6 rounded-[24px]"
          style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(10,111,120,0.09), transparent 65%)' }}
        >
          {yourTurnToDraw ? (
            <>
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => setState((current) => (current ? drawReplacement(current, 'player', 'deck') : current))}
                  aria-label="Draw from deck"
                >
                  <CardBack size="lg" />
                </button>
                <span className="mono-label text-[10px] text-ink-muted">Deck · {state.drawPile.length}</span>
              </div>
              {state.pendingPickup && (
                <div className="flex flex-col items-center gap-2">
                  <PlayingCard
                    card={state.pendingPickup}
                    jokerRank={state.jokerRank}
                    size="lg"
                    onClick={() => setState((current) => (current ? drawReplacement(current, 'player', 'pickup') : current))}
                  />
                  <span className="mono-label text-[10px] text-accent">Take this card</span>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex flex-col items-center gap-2">
                <CardBack size="lg" />
                <span className="mono-label text-[10px] text-ink-muted">Deck · {state.drawPile.length}</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                {discardTop ? (
                  <motion.div
                    key={discardTop.id}
                    initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={DEAL_SPRING}
                  >
                    <PlayingCard card={discardTop} jokerRank={state.jokerRank} size="lg" />
                  </motion.div>
                ) : (
                  <div className="h-24 w-16 rounded-lg border border-dashed border-hairline" />
                )}
                <span className="mono-label text-[10px] text-ink-muted">Discard</span>
              </div>
            </>
          )}
        </section>

        <p className="text-center text-sm text-ink-soft">{statusText()}</p>

        <section className="flex flex-col items-center gap-2.5">
          <span className="mono-label flex items-center gap-2 text-[11px] text-ink-muted">
            Your hand
            <span className="text-accent">{yourHandValue} pts</span>
          </span>
          <div className="flex flex-wrap justify-center gap-2" key={state.roundNumber}>
            <AnimatePresence mode="popLayout">
              {sortHand(state.hands.player).map((card, i) => (
                <motion.div
                  key={card.id}
                  layout
                  initial={{ opacity: 0, y: 40, scale: 0.7 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -50, scale: 0.6, transition: { duration: 0.22 } }}
                  transition={{ ...DEAL_SPRING, delay: i * 0.06 }}
                >
                  <PlayingCard
                    card={card}
                    jokerRank={state.jokerRank}
                    selected={selected.includes(card.id)}
                    disabled={!yourTurnToAct}
                    onClick={() => handleHandCardClick(card.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>

        <div className="flex gap-2.5 pb-1 pt-1">
          <button
            type="button"
            disabled={selected.length === 0 || !canPlaySelected}
            onClick={() => {
              setState((current) => (current ? playCards(current, 'player', selected) : current));
              setSelected([]);
            }}
            className="flex-1 rounded-2xl border-2 border-accent py-[15px] text-center font-bold text-accent transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Play {selected.length > 1 ? `(${selected.length})` : 'card'}
          </button>
          <button
            type="button"
            disabled={!canCallNow}
            onClick={() => setState((current) => (current ? call(current, 'player') : current))}
            className="flex-1 rounded-2xl bg-accent py-[15px] text-center font-bold text-white shadow-[0_5px_0_var(--accent-shadow)] transition-transform active:translate-y-[3px] active:shadow-[0_2px_0_var(--accent-shadow)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:active:translate-y-0"
          >
            Call!
          </button>
        </div>
      </div>

      {showRules && <RulesModal onClose={() => setShowRules(false)} />}

      {paused && (
        <PauseModal
          onResume={() => setPaused(false)}
          onRestart={() => {
            setState(newGame(state.target));
            setSelected([]);
            setPaused(false);
          }}
        />
      )}

      {state.phase === 'round-end' && state.lastRoundResult && !revealRoundEnd && (
        <CallAnnouncement callerLabel={state.lastRoundResult.caller === 'player' ? 'You' : 'Computer'} />
      )}

      {state.phase === 'round-end' && state.lastRoundResult && revealRoundEnd && (
        <RoundEndModal
          state={state}
          result={state.lastRoundResult}
          onContinue={() => setState((current) => (current ? startNextRound(current) : current))}
        />
      )}

      {state.phase === 'game-over' && (
        <GameOverModal
          state={state}
          onPlayAgain={() => setState(newGame(state.target))}
          onChangeTarget={() => setState(null)}
        />
      )}
    </div>
  );
}
