import { cardValue, handValue } from './deck';
import { call, canPlayCards, DECLARE_THRESHOLD, drawReplacement, playCards } from './engine';
import type { GameState, PlayingCard, Rank } from './types';

// You may only ever call at DECLARE_THRESHOLD or below, so the computer
// never rolls for it above that — but the lower under that ceiling its hand
// is, the likelier it calls rather than pushing its luck for a zero.
function callChance(handTotal: number): number {
  if (handTotal > DECLARE_THRESHOLD) return 0;
  if (handTotal === 0) return 1;
  if (handTotal <= 3) return 0.85;
  if (handTotal <= 6) return 0.55;
  return 0.3;
}

// Take the discard pile's offered card only if it's cheap; otherwise draw blind.
const PICKUP_VALUE_THRESHOLD = 5;

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
export function computerTakeTurn(state: GameState): GameState {
  const hand = state.hands.computer;
  const total = handValue(hand, state.jokerRank);

  if (Math.random() < callChance(total)) {
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

  const cardIds = toPlay.map((c) => c.id);
  if (!canPlayCards(state, 'computer', cardIds)) {
    return playCards(state, 'computer', [hand[0].id]);
  }

  const afterPlay = playCards(state, 'computer', cardIds);
  if (afterPlay.phase !== 'awaiting-replacement-draw') {
    return afterPlay; // matched the pile's top rank — no draw needed
  }

  const pickup = afterPlay.pendingPickup;
  const source = pickup && cardValue(pickup, state.jokerRank) < PICKUP_VALUE_THRESHOLD ? 'pickup' : 'deck';
  return drawReplacement(afterPlay, 'computer', source);
}
