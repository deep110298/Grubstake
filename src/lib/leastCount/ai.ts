import { cardValue, handValue } from './deck';
import { call, canPlayCards, drawReplacement, playCards } from './engine';
import type { GameState, PlayingCard, Rank } from './types';

// The lower a hand's value, the more likely the computer calls. (The
// original game intended this graduated escalation, but an ordering bug in
// its condition chain meant only the loosest bracket ever ran; this fixes
// the ordering while keeping the same brackets and odds.)
function callChance(handTotal: number): number {
  if (handTotal < 10) return 1;
  if (handTotal < 12) return 6 / 11;
  if (handTotal < 16) return 4 / 10;
  if (handTotal < 20) return 3 / 11;
  return 0;
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
