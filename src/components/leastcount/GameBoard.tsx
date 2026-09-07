'use client';

import { useEffect, useRef, useState } from 'react';
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
import GameOverModal from './GameOverModal';
import PlayingCard, { CardBack } from './PlayingCard';
import RoundEndModal from './RoundEndModal';
import RulesModal from './RulesModal';
import Scoreboard from './Scoreboard';
import SetupScreen from './SetupScreen';

export default function GameBoard() {
  const [state, setState] = useState<GameState | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [showRules, setShowRules] = useState(false);
  const computerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!state || state.turn !== 'computer' || state.phase !== 'awaiting-action') return;
    computerTimer.current = setTimeout(() => {
      setState((current) => (current ? computerTakeTurn(current) : current));
    }, 800);
    return () => {
      if (computerTimer.current) clearTimeout(computerTimer.current);
    };
  }, [state]);

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
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 py-4">
        <Scoreboard state={state} />

        <div className="flex items-center justify-between">
          <span className="mono-label inline-flex items-center gap-1.5 rounded-full bg-accent-tint px-3 py-1.5 text-sm font-semibold text-accent">
            🃏 Wild card: {state.jokerRank}
          </span>
          <button
            type="button"
            onClick={() => setShowRules(true)}
            className="mono-label text-xs text-ink-faint underline underline-offset-2 hover:text-ink"
          >
            Rules
          </button>
        </div>

        <section className="flex flex-col items-center gap-1.5">
          <span className="mono-label text-xs text-ink-faint">Computer&apos;s hand</span>
          <div className="flex gap-1.5">
            {state.hands.computer.map((card) => (
              <CardBack key={card.id} size="sm" />
            ))}
          </div>
        </section>

        <section className="flex flex-1 items-center justify-center gap-6">
          {yourTurnToDraw ? (
            <>
              <div className="flex flex-col items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setState((current) => (current ? drawReplacement(current, 'player', 'deck') : current))}
                  aria-label="Draw from deck"
                >
                  <CardBack size="lg" />
                </button>
                <span className="mono-label text-[11px] text-ink-faint">Deck ({state.drawPile.length})</span>
              </div>
              {state.pendingPickup && (
                <div className="flex flex-col items-center gap-1.5">
                  <PlayingCard
                    card={state.pendingPickup}
                    jokerRank={state.jokerRank}
                    size="lg"
                    onClick={() => setState((current) => (current ? drawReplacement(current, 'player', 'pickup') : current))}
                  />
                  <span className="mono-label text-[11px] text-ink-faint">Take this card</span>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex flex-col items-center gap-1.5">
                <CardBack size="lg" />
                <span className="mono-label text-[11px] text-ink-faint">Deck ({state.drawPile.length})</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                {discardTop ? (
                  <PlayingCard card={discardTop} jokerRank={state.jokerRank} size="lg" />
                ) : (
                  <div className="h-24 w-16 rounded-lg border border-dashed border-hairline" />
                )}
                <span className="mono-label text-[11px] text-ink-faint">Discard</span>
              </div>
            </>
          )}
        </section>

        <p className="text-center text-sm text-ink-muted">{statusText()}</p>

        <section className="flex flex-col items-center gap-2">
          <span className="mono-label text-xs text-ink-faint">Your hand</span>
          <div className="flex flex-wrap justify-center gap-2">
            {sortHand(state.hands.player).map((card) => (
              <PlayingCard
                key={card.id}
                card={card}
                jokerRank={state.jokerRank}
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
              setState((current) => (current ? playCards(current, 'player', selected) : current));
              setSelected([]);
            }}
            className="flex-1 rounded-lg border border-accent px-4 py-2.5 font-medium text-accent transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
          >
            Play {selected.length > 1 ? `(${selected.length})` : 'card'}
          </button>
          <button
            type="button"
            disabled={!canCallNow}
            onClick={() => setState((current) => (current ? call(current, 'player') : current))}
            className="flex-1 rounded-lg bg-accent px-4 py-2.5 font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Call Least Count!
          </button>
        </div>
      </div>

      {showRules && <RulesModal onClose={() => setShowRules(false)} />}

      {state.phase === 'round-end' && state.lastRoundResult && (
        <RoundEndModal
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
