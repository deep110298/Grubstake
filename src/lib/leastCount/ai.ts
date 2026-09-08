import { cardValue, handValue } from './deck';
import { call, canPlayCards, DECLARE_THRESHOLD, drawReplacement, playCards } from './engine';
import type { GameState, PlayingCard, Rank } from './types';

export type Difficulty = 'easy' | 'medium' | 'hard';

// How eagerly the computer calls once its hand is callable — easy hesitates
// and leaves points on the table, hard seizes a good call the moment it's there.
const CALL_CHANCE_MULTIPLIER: Record<Difficulty, number> = {
  easy: 0.5,
  medium: 1,
  hard: 1.3,
};

// You may only ever call at DECLARE_THRESHOLD or below, so the computer
// never rolls for it above that — but the lower under that ceiling its hand
// is, the likelier it calls rather than pushing its luck for a zero.
function callChance(handTotal: number, difficulty: Difficulty): number {
  if (handTotal > DECLARE_THRESHOLD) return 0;
  if (handTotal === 0) return 1;
  const base = handTotal <= 3 ? 0.85 : handTotal <= 6 ? 0.55 : 0.3;
  return Math.min(1, base * CALL_CHANCE_MULTIPLIER[difficulty]);
}

// Chance the computer ignores its best move and plays a random card instead,
// simulating a weaker player misreading the board. Zero on hard.
const MISTAKE_CHANCE: Record<Difficulty, number> = {
  easy: 0.35,
  medium: 0.08,
  hard: 0,
};

// Take the discard pile's offered card only if it's cheap; otherwise draw
// blind. Hard is willing to take a pricier known card over a blind gamble.
const PICKUP_VALUE_THRESHOLD: Record<Difficulty, number> = {
  easy: 3,
  medium: 5,
  hard: 7,
};

function groupByRank(hand: PlayingCard[]): PlayingCard[][] {
  const groups = new Map<Rank, PlayingCard[]>();
  for (const card of hand) {
    const group = groups.get(card.rank) ?? [];
    group.push(card);
    groups.set(card.rank, group);
  }
  return [...groups.values()];
}

// The rank-group (a single card counts as a group of one) with the highest total value.
function bestGroup(hand: PlayingCard[], jokerRank: Rank): PlayingCard[] {
  let best = [hand[0]];
  let bestTotal = -1;
  for (const group of groupByRank(hand)) {
    const total = group.length * cardValue(group[0], jokerRank);
    if (total > bestTotal) {
      best = group;
      bestTotal = total;
    }
  }
  return best;
}

// Plays a full computer turn (call, or play card(s) plus any required
// replacement draw) and returns the resulting state. Only reads public
// information and the computer's own hand.
export function computerTakeTurn(state: GameState, difficulty: Difficulty = 'medium'): GameState {
  const hand = state.hands.computer;
  const total = handValue(hand, state.jokerRank);

  if (Math.random() < callChance(total, difficulty)) {
    return call(state, 'computer');
  }

  const discardTop = state.discardPile[state.discardPile.length - 1];
  const matchingTop = discardTop ? hand.filter((c) => c.rank === discardTop.rank) : [];
  const best = bestGroup(hand, state.jokerRank);

  let toPlay = best;
  if (matchingTop.length > 0) {
    // A free (no-draw) play is worth a small bonus per card over a play that requires a draw.
    const freeValue = matchingTop.length * (cardValue(matchingTop[0], state.jokerRank) + 5);
    const bestValue = best.length * cardValue(best[0], state.jokerRank);
    toPlay = freeValue >= bestValue ? matchingTop : best;
  }

  if (Math.random() < MISTAKE_CHANCE[difficulty]) {
    toPlay = [hand[Math.floor(Math.random() * hand.length)]];
  }

  const cardIds = toPlay.map((c) => c.id);
  if (!canPlayCards(state, 'computer', cardIds)) {
    return playCards(state, 'computer', [hand[0].id]);
  }

  const afterPlay = playCards(state, 'computer', cardIds);
  if (afterPlay.phase !== 'awaiting-replacement-draw') {
    return afterPlay; // matched the pile's top rank — no draw needed
  }

  const pickup = afterPlay.pendingPickup;
  const source = pickup && cardValue(pickup, state.jokerRank) < PICKUP_VALUE_THRESHOLD[difficulty] ? 'pickup' : 'deck';
  return drawReplacement(afterPlay, 'computer', source);
}
