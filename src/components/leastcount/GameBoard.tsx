'use client';

import { useEffect, useRef, useState } from 'react';
import { computerTakeTurn } from '@/lib/leastCount/ai';
import { sortHand } from '@/lib/leastCount/deck';
import {
  call,
  canAct,
  canDiscard,
  canPlaySet,
  discardCard,
  drawFromDeck,
  drawFromDiscard,
  newGame,
  playSet,
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
  const yourTurnToDiscard = canDiscard(state, 'player');
  const canCallNow = yourTurnToAct;
  const canPlaySelectedSet = canPlaySet(state, 'player', selected);

  function handleHandCardClick(cardId: string) {
    if (yourTurnToDiscard) {
      setState((current) => (current ? discardCard(current, 'player', cardId) : current));
      setSelected([]);
      return;
    }
    if (yourTurnToAct) {
      setSelected((current) =>
        current.includes(cardId) ? current.filter((id) => id !== cardId) : [...current, cardId]
      );
    }
  }

  function statusText(): string {
    if (state!.turn === 'computer') return 'Computer is playing…';
    if (yourTurnToDiscard) return 'Choose a card to discard.';
    if (selected.length > 0) return 'Tap "Play set" to discard matching cards, or keep choosing.';
    return 'Draw from the deck or discard pile, play a set, or call Least Count.';
  }

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 py-4">
        <div className="flex items-center justify-between">
          <Scoreboard state={state} />
        </div>

        <div className="flex items-center justify-between">
          <span className="mono-label text-xs text-ink-faint">
            Joker rank: <span className="text-accent">{state.jokerRank}</span>
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
          <div className="flex flex-col items-center gap-1.5">
            <button
              type="button"
              onClick={() => setState((current) => (current ? drawFromDeck(current, 'player') : current))}
              disabled={!yourTurnToAct}
              className="disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Draw from deck"
            >
              <CardBack size="lg" />
            </button>
            <span className="mono-label text-[11px] text-ink-faint">Deck ({state.drawPile.length})</span>
          </div>

          <div className="flex flex-col items-center gap-1.5">
            {state.discardPile.length > 0 ? (
              <PlayingCard
                card={state.discardPile[state.discardPile.length - 1]}
                jokerRank={state.jokerRank}
                size="lg"
                disabled={!yourTurnToAct}
                onClick={() => setState((current) => (current ? drawFromDiscard(current, 'player') : current))}
              />
            ) : (
              <div className="h-24 w-16 rounded-lg border border-dashed border-hairline" />
            )}
            <span className="mono-label text-[11px] text-ink-faint">Discard</span>
          </div>
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
                disabled={!yourTurnToAct && !yourTurnToDiscard}
                onClick={() => handleHandCardClick(card.id)}
              />
            ))}
          </div>
        </section>

        <div className="flex gap-2 pb-2">
          {selected.length >= 2 && (
            <button
              type="button"
              disabled={!canPlaySelectedSet}
              onClick={() => {
                setState((current) => (current ? playSet(current, 'player', selected) : current));
                setSelected([]);
              }}
              className="flex-1 rounded-lg border border-accent px-4 py-2.5 font-medium text-accent transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
            >
              Play set ({selected.length})
            </button>
          )}
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
