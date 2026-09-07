'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { handValue, sortHand } from '@/lib/multiplayer/deck';
import {
  call,
  canAct,
  canCall,
  canDrawReplacement,
  canPlayCards,
  DECLARE_THRESHOLD,
  drawReplacement,
  playCards,
} from '@/lib/multiplayer/engine';
import type { MPGameState } from '@/lib/multiplayer/types';
import CallAnnouncement from '@/components/leastcount/CallAnnouncement';
import PlayingCard, { CardBack } from '@/components/leastcount/PlayingCard';
import RulesModal from '@/components/leastcount/RulesModal';
import WildCardRevealModal from '@/components/leastcount/WildCardRevealModal';
import MPScoreboard from './MPScoreboard';
import MPRoundEndModal from './MPRoundEndModal';
import MPGameOverModal from './MPGameOverModal';

const DEAL_SPRING = { type: 'spring' as const, stiffness: 320, damping: 26 };
const CALL_REVEAL_DELAY = 2200;

export default function MultiplayerGameBoard({
  state,
  code,
  myPlayerId,
  isHost,
  onUpdate,
  onNextRound,
  onPlayAgain,
  onLeave,
}: {
  state: MPGameState;
  code?: string;
  myPlayerId: string;
  isHost: boolean;
  onUpdate: (next: MPGameState) => void;
  onNextRound: () => void;
  onPlayAgain: () => void;
  onLeave: () => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [showRules, setShowRules] = useState(false);
  const [localOverride, setLocalOverride] = useState<MPGameState | null>(null);
  const [revealRoundEnd, setRevealRoundEnd] = useState(false);
  const [prevRoundEndKey, setPrevRoundEndKey] = useState<string | null>(null);

  // Once the authoritative state from the server changes, drop any
  // optimistic override and pending selection for the turn that just ended.
  // (Adjusting state during render, rather than in an effect, per
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes.)
  const [prevState, setPrevState] = useState(state);
  if (prevState !== state) {
    setPrevState(state);
    setLocalOverride(null);
    setSelected([]);
  }

  const display = localOverride ?? state;

  // Reset whether the round breakdown has been revealed yet whenever we
  // enter (or leave) the round-end phase — adjusting state during render
  // rather than in an effect, same reasoning as above.
  const roundEndKey = display.phase === 'round-end' ? String(display.roundNumber) : null;
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

  function commit(next: MPGameState) {
    setLocalOverride(next);
    onUpdate(next);
  }

  const iAmEliminated = display.eliminated.includes(myPlayerId);
  const yourTurnToAct = canAct(display, myPlayerId);
  const yourTurnToDraw = canDrawReplacement(display, myPlayerId);
  const canPlaySelected = canPlayCards(display, myPlayerId, selected);
  const canCallNow = canCall(display, myPlayerId);
  const myHand = display.hands[myPlayerId] ?? [];
  const myHandValue = handValue(myHand, display.jokerRank);
  const discardTop = display.discardPile[display.discardPile.length - 1];

  function handleHandCardClick(cardId: string) {
    if (!yourTurnToAct) return;
    setSelected((current) => {
      if (current.includes(cardId)) return current.filter((id) => id !== cardId);
      const card = myHand.find((c) => c.id === cardId);
      const first = myHand.find((c) => c.id === current[0]);
      if (first && card && first.rank !== card.rank) return [cardId];
      return [...current, cardId];
    });
  }

  function statusText(): string {
    if (display.phase === 'round-end' || display.phase === 'game-over') return '';
    if (iAmEliminated) return `You're out — watching ${display.names[display.turn]} and the rest play it out.`;
    if (yourTurnToAct) {
      if (selected.length > 0) return 'Tap "Play" to discard the selected card(s).';
      if (!canCallNow) {
        return `Choose a card from your hand to play. (You need ${DECLARE_THRESHOLD} or less to call — you have ${myHandValue}.)`;
      }
      return 'Choose a card from your hand to play, or call Least Count.';
    }
    if (yourTurnToDraw) return 'Doesn’t match — draw a replacement card.';
    return `Waiting for ${display.names[display.turn]}…`;
  }

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <WildCardRevealModal jokerRank={state.jokerRank} />
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-3.5 px-4 py-4">
        <div className="flex items-center justify-between">
          <span className="mono-label text-[11px] text-ink-muted">
            {code ? `Room ${code} · ` : ''}Round {display.roundNumber}
          </span>
          <div className="flex items-center gap-2.5">
            <span className="mono-label inline-flex items-center gap-2 rounded-full bg-wild px-3.5 py-1.5 text-[11px] font-bold text-white shadow-[0_2px_0_var(--wild-shadow)]">
              WILD · {display.jokerRank}
            </span>
            <button
              type="button"
              onClick={() => setShowRules(true)}
              className="mono-label text-[11px] text-ink-muted hover:text-ink"
            >
              Rules
            </button>
          </div>
        </div>

        <MPScoreboard state={display} />

        <section
          className="flex flex-1 items-center justify-center gap-6 rounded-[24px]"
          style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(10,111,120,0.09), transparent 65%)' }}
        >
          {!iAmEliminated && yourTurnToDraw ? (
            <>
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => commit(drawReplacement(display, myPlayerId, 'deck'))}
                  aria-label="Draw from deck"
                >
                  <CardBack size="lg" />
                </button>
                <span className="mono-label text-[10px] text-ink-muted">Deck · {display.drawPile.length}</span>
              </div>
              {display.pendingPickup && (
                <div className="flex flex-col items-center gap-2">
                  <PlayingCard
                    card={display.pendingPickup}
                    jokerRank={display.jokerRank}
                    size="lg"
                    onClick={() => commit(drawReplacement(display, myPlayerId, 'pickup'))}
                  />
                  <span className="mono-label text-[10px] text-accent">Take this card</span>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex flex-col items-center gap-2">
                <CardBack size="lg" />
                <span className="mono-label text-[10px] text-ink-muted">Deck · {display.drawPile.length}</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                {discardTop ? (
                  <motion.div
                    key={discardTop.id}
                    initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={DEAL_SPRING}
                  >
                    <PlayingCard card={discardTop} jokerRank={display.jokerRank} size="lg" />
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

        {!iAmEliminated && (
          <>
            <section className="flex flex-col items-center gap-2.5">
              <span className="mono-label flex items-center gap-2 text-[11px] text-ink-muted">
                Your hand
                <span className="text-accent">{myHandValue} pts</span>
              </span>
              <div className="flex flex-wrap justify-center gap-2" key={display.roundNumber}>
                <AnimatePresence mode="popLayout">
                  {sortHand(myHand).map((card, i) => (
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
                        jokerRank={display.jokerRank}
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
                  commit(playCards(display, myPlayerId, selected));
                }}
                className="flex-1 rounded-2xl border-2 border-accent py-[15px] text-center font-bold text-accent transition-transform active:scale-95 disabled:cursor-not-allowed disabled:border-hairline-strong disabled:text-ink-faint disabled:opacity-100"
              >
                Play {selected.length > 1 ? `(${selected.length})` : 'card'}
              </button>
              <button
                type="button"
                disabled={!canCallNow}
                onClick={() => commit(call(display, myPlayerId))}
                className="flex-1 rounded-2xl bg-accent py-[15px] text-center font-bold text-white shadow-[0_5px_0_var(--accent-shadow)] transition-transform active:translate-y-[3px] active:shadow-[0_2px_0_var(--accent-shadow)] disabled:cursor-not-allowed disabled:bg-hairline disabled:text-ink-faint disabled:shadow-none disabled:active:translate-y-0"
              >
                Call at {DECLARE_THRESHOLD}
              </button>
            </div>
          </>
        )}
      </div>

      {showRules && <RulesModal variant="friends" onClose={() => setShowRules(false)} />}

      {display.phase === 'round-end' && display.lastRoundResult && !revealRoundEnd && (
        <CallAnnouncement callerLabel={display.names[display.lastRoundResult.caller]} />
      )}

      {display.phase === 'round-end' && display.lastRoundResult && revealRoundEnd && (
        <MPRoundEndModal
          state={display}
          result={display.lastRoundResult}
          isHost={isHost}
          onContinue={onNextRound}
        />
      )}

      {display.phase === 'game-over' && (
        <MPGameOverModal state={display} isHost={isHost} onPlayAgain={onPlayAgain} onLeave={onLeave} />
      )}
    </div>
  );
}
