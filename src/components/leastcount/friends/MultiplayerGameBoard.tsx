'use client';

import { useState } from 'react';
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
import PlayingCard, { CardBack } from '@/components/leastcount/PlayingCard';
import RulesModal from '@/components/leastcount/RulesModal';
import MPScoreboard from './MPScoreboard';
import MPRoundEndModal from './MPRoundEndModal';
import MPGameOverModal from './MPGameOverModal';

export default function MultiplayerGameBoard({
  state,
  myPlayerId,
  isHost,
  onUpdate,
  onNextRound,
  onPlayAgain,
  onLeave,
}: {
  state: MPGameState;
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
  const otherSeats = display.seats.filter((seat) => seat !== myPlayerId);

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
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 py-4">
        <MPScoreboard state={display} />

        <div className="flex items-center justify-between">
          <span className="mono-label text-xs text-ink-faint">
            Joker rank: <span className="text-accent">{display.jokerRank}</span>
          </span>
          <button
            type="button"
            onClick={() => setShowRules(true)}
            className="mono-label text-xs text-ink-faint underline underline-offset-2 hover:text-ink"
          >
            Rules
          </button>
        </div>

        <section className="flex flex-wrap justify-center gap-3">
          {otherSeats.map((seat) => {
            const isOut = display.eliminated.includes(seat);
            return (
              <div key={seat} className="flex flex-col items-center gap-1">
                <span className="mono-label text-xs text-ink-faint">
                  {display.names[seat]}
                  {isOut && ' (out)'}
                </span>
                {isOut ? (
                  <div className="h-14 w-10" />
                ) : (
                  <div className="flex gap-1">
                    {(display.hands[seat] ?? []).map((card) => (
                      <CardBack key={card.id} size="sm" />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </section>

        {!iAmEliminated && (
          <section className="flex flex-1 items-center justify-center gap-6">
            {yourTurnToDraw ? (
              <>
                <div className="flex flex-col items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => commit(drawReplacement(display, myPlayerId, 'deck'))}
                    aria-label="Draw from deck"
                  >
                    <CardBack size="lg" />
                  </button>
                  <span className="mono-label text-[11px] text-ink-faint">Deck ({display.drawPile.length})</span>
                </div>
                {display.pendingPickup && (
                  <div className="flex flex-col items-center gap-1.5">
                    <PlayingCard
                      card={display.pendingPickup}
                      jokerRank={display.jokerRank}
                      size="lg"
                      onClick={() => commit(drawReplacement(display, myPlayerId, 'pickup'))}
                    />
                    <span className="mono-label text-[11px] text-ink-faint">Take this card</span>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex flex-col items-center gap-1.5">
                  <CardBack size="lg" />
                  <span className="mono-label text-[11px] text-ink-faint">Deck ({display.drawPile.length})</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  {discardTop ? (
                    <PlayingCard card={discardTop} jokerRank={display.jokerRank} size="lg" />
                  ) : (
                    <div className="h-24 w-16 rounded-lg border border-dashed border-hairline" />
                  )}
                  <span className="mono-label text-[11px] text-ink-faint">Discard</span>
                </div>
              </>
            )}
          </section>
        )}

        <p className="text-center text-sm text-ink-muted">{statusText()}</p>

        {!iAmEliminated && (
          <>
            <section className="flex flex-col items-center gap-2">
              <span className="mono-label text-xs text-ink-faint">Your hand</span>
              <div className="flex flex-wrap justify-center gap-2">
                {sortHand(myHand).map((card) => (
                  <PlayingCard
                    key={card.id}
                    card={card}
                    jokerRank={display.jokerRank}
                    selected={selected.includes(card.id)}
                    disabled={!yourTurnToAct}
                    onClick={() => handleHandCardClick(card.id)}
                  />
                ))}
              </div>
            </section>

            <div className="flex gap-2 pb-2">
              <button
                type="button"
                disabled={selected.length === 0 || !canPlaySelected}
                onClick={() => {
                  commit(playCards(display, myPlayerId, selected));
                }}
                className="flex-1 rounded-lg border border-accent px-4 py-2.5 font-medium text-accent transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
              >
                Play {selected.length > 1 ? `(${selected.length})` : 'card'}
              </button>
              <button
                type="button"
                disabled={!canCallNow}
                onClick={() => commit(call(display, myPlayerId))}
                className="flex-1 rounded-lg bg-accent px-4 py-2.5 font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Call Least Count!
              </button>
            </div>
          </>
        )}
      </div>

      {showRules && <RulesModal variant="friends" onClose={() => setShowRules(false)} />}

      {display.phase === 'round-end' && display.lastRoundResult && (
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
