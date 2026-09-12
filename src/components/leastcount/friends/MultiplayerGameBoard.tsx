'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, Reorder } from 'framer-motion';
import { handValue, sortHand } from '@/lib/multiplayer/deck';
import {
  call,
  canAct,
  canCall,
  canDrawReplacement,
  canPlayCards,
  drawReplacement,
  playCards,
} from '@/lib/multiplayer/engine';
import { QUICK_CHAT_MESSAGES, subscribeToQuickChat, type QuickChatEvent } from '@/lib/multiplayer/quickChat';
import type { MPGameState } from '@/lib/multiplayer/types';
import { hideGlobalThemeToggle, showGlobalThemeToggle } from '@/lib/themeToggleVisibility';
import InlineThemeToggle from '@/components/InlineThemeToggle';
import CallAnnouncement from '@/components/leastcount/CallAnnouncement';
import PlayingCard, { CardBack } from '@/components/leastcount/PlayingCard';
import RulesModal from '@/components/leastcount/RulesModal';
import WildCardRevealModal from '@/components/leastcount/WildCardRevealModal';
import MPScoreboard from './MPScoreboard';
import MPRoundEndModal from './MPRoundEndModal';
import MPGameOverModal from './MPGameOverModal';
import MPPauseModal from './MPPauseModal';

const DEAL_SPRING = { type: 'spring' as const, stiffness: 320, damping: 26 };
const CALL_REVEAL_DELAY = 2200;
const BUBBLE_LIFETIME = 5000;

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
  onUpdate: (next: MPGameState) => Promise<void> | void;
  onNextRound: () => void;
  onPlayAgain: () => void;
  onLeave: () => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [showRules, setShowRules] = useState(false);
  const [paused, setPaused] = useState(false);
  const [localOverride, setLocalOverride] = useState<MPGameState | null>(null);
  const [revealRoundEnd, setRevealRoundEnd] = useState(false);
  const [prevRoundEndKey, setPrevRoundEndKey] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [bubbles, setBubbles] = useState<(QuickChatEvent & { id: number })[]>([]);
  const chatRef = useRef<ReturnType<typeof subscribeToQuickChat> | null>(null);

  // The board's own header has an inline toggle right under Rules — the
  // fixed corner one would otherwise sit on top of the scoreboard, whose
  // height varies with player count.
  useEffect(() => {
    hideGlobalThemeToggle();
    return () => showGlobalThemeToggle();
  }, []);

  function pushBubble(event: QuickChatEvent) {
    const id = Date.now() + Math.random();
    setBubbles((current) => [...current, { ...event, id }]);
    setTimeout(() => setBubbles((current) => current.filter((b) => b.id !== id)), BUBBLE_LIFETIME);
  }

  useEffect(() => {
    if (!code) return;
    const chat = subscribeToQuickChat(code, pushBubble);
    chatRef.current = chat;
    return () => {
      chatRef.current = null;
      chat.unsubscribe();
    };
  }, [code]);

  function sendQuickChat(text: string) {
    const event: QuickChatEvent = { playerId: myPlayerId, name: display.names[myPlayerId] ?? 'You', text };
    chatRef.current?.send(event);
    pushBubble(event);
    setChatOpen(false);
  }

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
    // If the write to Supabase fails (network blip, dropped connection),
    // roll the optimistic update back rather than leaving this client
    // stuck showing a move that never actually landed — the exact
    // symptom that used to freeze a room until someone rejoined.
    Promise.resolve(onUpdate(next)).catch(() => setLocalOverride(null));
  }

  const iAmEliminated = display.eliminated.includes(myPlayerId);
  const yourTurnToAct = canAct(display, myPlayerId);
  const yourTurnToDraw = canDrawReplacement(display, myPlayerId);
  const canPlaySelected = canPlayCards(display, myPlayerId, selected);
  const canCallNow = canCall(display, myPlayerId);
  const myHand = display.hands[myPlayerId] ?? [];
  const myHandValue = handValue(myHand, display.jokerRank);
  const discardTop = display.discardPile[display.discardPile.length - 1];

  // The player's own preferred card order — starts sorted, then only ever
  // changes via their own drag, or to fold in cards a draw/new round added.
  // Adjusted during render (rather than in an effect) when the hand's own
  // identity changes, same reasoning as prevState/localOverride above:
  // existing order is preserved, new cards are appended in sorted order.
  const [handOrder, setHandOrder] = useState<string[]>(() => sortHand(myHand).map((c) => c.id));
  const [prevHand, setPrevHand] = useState(myHand);
  if (prevHand !== myHand) {
    setPrevHand(myHand);
    const currentIds = new Set(myHand.map((c) => c.id));
    const kept = handOrder.filter((id) => currentIds.has(id));
    const additions = sortHand(myHand)
      .map((c) => c.id)
      .filter((id) => !kept.includes(id));
    setHandOrder([...kept, ...additions]);
  }

  // A one-time nudge that the hand can be dragged into any order — shown at
  // the start of every fresh game (round 1), not on every round. Whether to
  // show it is decided during render (the isFirstRound edge, same pattern as
  // above); the 5s auto-hide is the one genuine side effect (a timer).
  const isFirstRound = display.roundNumber === 1;
  const [showHandHint, setShowHandHint] = useState(isFirstRound);
  const [prevIsFirstRound, setPrevIsFirstRound] = useState(isFirstRound);
  if (isFirstRound !== prevIsFirstRound) {
    setPrevIsFirstRound(isFirstRound);
    setShowHandHint(isFirstRound);
  }
  useEffect(() => {
    if (!showHandHint) return;
    const timer = setTimeout(() => setShowHandHint(false), 5000);
    return () => clearTimeout(timer);
  }, [showHandHint]);

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

  return (
    <div className="relative flex min-h-dvh flex-col bg-canvas">
      <WildCardRevealModal jokerRank={state.jokerRank} />

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-3.5 px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center">
          <span className="mono-label text-[11px] text-ink-soft">{code ? `Room ${code}` : ''}</span>
          <span className="mono-label inline-flex items-center gap-2 rounded-full bg-wild px-3.5 py-1.5 text-[11px] font-bold text-white shadow-[0_2px_0_var(--wild-shadow)]">
            WILD · {display.jokerRank}
          </span>
          <div className="relative justify-self-end">
            <button
              type="button"
              onClick={() => setChatOpen((v) => !v)}
              aria-label="Quick chat"
              className="flex h-7 w-7 items-center justify-center rounded-full border border-hairline bg-surface text-ink-soft transition-transform active:scale-90"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                <path
                  d="M4 5.5C4 4.67 4.67 4 5.5 4h13c.83 0 1.5.67 1.5 1.5v9c0 .83-.67 1.5-1.5 1.5H9l-4 3.5v-3.5H5.5C4.67 16 4 15.33 4 14.5v-9Z"
                  fill="currentColor"
                />
                <circle cx="8.5" cy="9.75" r="1" fill="var(--surface)" />
                <circle cx="12" cy="9.75" r="1" fill="var(--surface)" />
                <circle cx="15.5" cy="9.75" r="1" fill="var(--surface)" />
              </svg>
            </button>
            {chatOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setChatOpen(false)} />
                <div className="absolute right-0 top-9 z-50 flex w-max flex-col gap-0.5 rounded-2xl border border-hairline bg-surface p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.15)]">
                  {QUICK_CHAT_MESSAGES.map((msg) => (
                    <button
                      key={msg}
                      type="button"
                      onClick={() => sendQuickChat(msg)}
                      className="whitespace-nowrap rounded-xl px-3 py-1.5 text-left text-xs font-semibold text-ink transition-colors hover:bg-surface-sunken"
                    >
                      {msg}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <MPScoreboard state={display} />

        <div className="-mt-1 grid grid-cols-[1fr_auto_1fr] items-start">
          <button
            type="button"
            onClick={() => setPaused(true)}
            className="mono-label justify-self-start text-[11px] text-ink-soft hover:text-ink"
          >
            Pause
          </button>
          <span className="mono-label text-[11px] text-ink-soft">Round {display.roundNumber}</span>
          <div className="flex flex-col items-end gap-1.5 justify-self-end">
            <button
              type="button"
              onClick={() => setShowRules(true)}
              className="mono-label text-[11px] text-ink-soft hover:text-ink"
            >
              Rules
            </button>
            <InlineThemeToggle />
          </div>
        </div>

        <section
          className="relative flex flex-1 items-center justify-center gap-6 rounded-[24px]"
          style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(10,111,120,0.09), transparent 65%)' }}
        >
          {bubbles.length > 0 && (
            <div className="pointer-events-none absolute inset-x-0 top-3 z-10 flex flex-col items-center gap-1.5 px-4">
              <AnimatePresence>
                {bubbles.map((b) => (
                  <motion.div
                    key={b.id}
                    initial={{ opacity: 0, y: -10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="mono-label max-w-[85%] rounded-full bg-[#1c1a20]/90 px-3.5 py-1.5 text-[11px] font-bold text-white shadow-[0_4px_10px_rgba(0,0,0,0.2)]"
                  >
                    <span className="text-white/55">{b.name}:</span> {b.text}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

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
                <span className="mono-label text-[10px] text-accent">Tap to draw · {display.drawPile.length}</span>
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
                <span className="mono-label text-[10px] text-ink-soft">Deck · {display.drawPile.length}</span>
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
                <span className="mono-label text-[10px] text-ink-soft">Discard</span>
              </div>
            </>
          )}
        </section>

        {!iAmEliminated && (
          <>
            <section className="flex flex-col items-center gap-2.5">
              <span className="mono-label flex items-center gap-2 text-[11px] text-ink-soft">
                Your hand
                <span className="text-accent">{myHandValue} pts</span>
              </span>
              <div className="relative w-full">
                <Reorder.Group
                  as="ul"
                  axis="x"
                  values={handOrder}
                  onReorder={setHandOrder}
                  className="flex list-none justify-center gap-2 overflow-x-auto px-1 py-1"
                  key={display.roundNumber}
                >
                  <AnimatePresence mode="popLayout">
                    {handOrder.map((id, i) => {
                      const card = myHand.find((c) => c.id === id);
                      if (!card) return null;
                      return (
                        <Reorder.Item
                          key={id}
                          value={id}
                          as="li"
                          initial={{ opacity: 0, y: 40, scale: 0.7 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -50, scale: 0.6, transition: { duration: 0.22 } }}
                          whileDrag={{ scale: 1.08, zIndex: 1 }}
                          transition={{ ...DEAL_SPRING, delay: i * 0.06 }}
                          className="flex-shrink-0"
                        >
                          <PlayingCard
                            card={card}
                            jokerRank={display.jokerRank}
                            selected={selected.includes(card.id)}
                            disabled={!yourTurnToAct}
                            onClick={() => handleHandCardClick(card.id)}
                          />
                        </Reorder.Item>
                      );
                    })}
                  </AnimatePresence>
                </Reorder.Group>

                <AnimatePresence>
                  {showHandHint && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85, y: -6 }}
                      transition={{ duration: 0.3 }}
                      className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-4"
                    >
                      <span className="mono-label max-w-[240px] rounded-2xl bg-[#1c1a20]/90 px-4 py-2.5 text-center text-[11px] font-bold leading-relaxed text-white shadow-[0_4px_10px_rgba(0,0,0,0.25)]">
                        🔀 Drag your cards to arrange them however you like
                      </span>
                    </motion.div>
                  )}
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
                Least Count
              </button>
            </div>
          </>
        )}
      </div>

      {showRules && <RulesModal variant="friends" onClose={() => setShowRules(false)} />}

      {paused && <MPPauseModal onResume={() => setPaused(false)} onLeave={onLeave} />}

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
        <MPGameOverModal
          state={display}
          myPlayerId={myPlayerId}
          isHost={isHost}
          onPlayAgain={onPlayAgain}
          onLeave={onLeave}
        />
      )}
    </div>
  );
}
