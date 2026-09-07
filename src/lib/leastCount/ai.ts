import { cardValue, handValue } from './deck';
import { call, canPlaySet, discardCard, drawFromDeck, drawFromDiscard, playSet } from './engine';
import type { GameState, PlayingCard } from './types';

const CALL_THRESHOLD = 5;
const SET_VALUE_THRESHOLD = 10;

function worstCard(hand: PlayingCard[], jokerRank: GameState['jokerRank']): PlayingCard {
  return hand.reduce((worst, card) =>
    cardValue(card, jokerRank) > cardValue(worst, jokerRank) ? card : worst
  , hand[0]);
}

function bestSet(hand: PlayingCard[], jokerRank: GameState['jokerRank']): PlayingCard[] | null {
  const byRank = new Map<string, PlayingCard[]>();
  for (const card of hand) {
    if (card.rank === jokerRank) continue; // joker-rank cards are already worth zero
    const group = byRank.get(card.rank) ?? [];
    group.push(card);
    byRank.set(card.rank, group);
  }

  let best: PlayingCard[] | null = null;
  for (const group of byRank.values()) {
    if (group.length < 2) continue;
    const value = group.length * cardValue(group[0], jokerRank);
    if (value >= SET_VALUE_THRESHOLD && (!best || value > best.length * cardValue(best[0], jokerRank))) {
      best = group;
    }
  }
  return best;
}

// Plays a full computer turn (call, play a set, or draw + discard) and
// returns the resulting state. Only reads public information and the
// computer's own hand.
export function computerTakeTurn(state: GameState): GameState {
  const hand = state.hands.computer;
  const currentValue = handValue(hand, state.jokerRank);

  if (currentValue <= CALL_THRESHOLD) {
    return call(state, 'computer');
  }

  const set = bestSet(hand, state.jokerRank);
  if (set && canPlaySet(state, 'computer', set.map((c) => c.id))) {
    return playSet(state, 'computer', set.map((c) => c.id));
  }

  const discardTop = state.discardPile[state.discardPile.length - 1];
  const worst = worstCard(hand, state.jokerRank);
  const takeDiscard =
    discardTop !== undefined &&
    cardValue(discardTop, state.jokerRank) < cardValue(worst, state.jokerRank);

  const afterDraw = takeDiscard
    ? drawFromDiscard(state, 'computer')
    : drawFromDeck(state, 'computer');

  const grownHand = afterDraw.hands.computer;
  const toDiscard = worstCard(grownHand, state.jokerRank);
  return discardCard(afterDraw, 'computer', toDiscard.id);
}
