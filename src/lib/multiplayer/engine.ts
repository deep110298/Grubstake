import { createDeck, drawFromPile, handValue, shuffle } from '@/lib/leastCount/deck';
import { HAND_SIZE, INCORRECT_CALL_PENALTY } from '@/lib/leastCount/engine';
import type { Rank } from '@/lib/leastCount/types';
import type { MPGameState, MPRoundResult } from './types';

export { HAND_SIZE, INCORRECT_CALL_PENALTY };

/*
 * This is a friends-multiplayer extension of the verified 2-player Least
 * Count rules (see src/lib/leastCount/engine.ts) generalized to 2-4 players.
 * The original game (and its source) only ever defines "you vs the
 * computer," so two things had to be extrapolated for N players:
 *
 * - Tie-break on a call: the 2-player source scores an exact tie as a win
 *   for the computer specifically, which has no meaning without a
 *   computer. Here a call is correct whenever the caller's hand is AT
 *   LEAST as low as everyone else's (ties favor the caller).
 * - Scoring on a wrong call: the source only ever touches the wrong
 *   caller's score (+40) and leaves the other player untouched. That
 *   generalizes directly — on a wrong call, only the caller's score
 *   changes; on a correct call, everyone except the caller scores their
 *   actual hand value, same as the 2-player version.
 */

function nextSeat(seats: string[], current: string): string {
  const index = seats.indexOf(current);
  return seats[(index + 1) % seats.length];
}

function dealRound(
  seats: string[],
  names: Record<string, string>,
  target: number,
  scores: Record<string, number>,
  roundNumber: number
): MPGameState {
  const deck = shuffle(createDeck());

  const jokerIndex = Math.floor(Math.random() * deck.length);
  const jokerRank: Rank = deck[jokerIndex].rank;
  const pool = [...deck.slice(0, jokerIndex), ...deck.slice(jokerIndex + 1)];

  const hands: Record<string, typeof pool> = {};
  let cursor = 0;
  for (const seat of seats) {
    hands[seat] = pool.slice(cursor, cursor + HAND_SIZE);
    cursor += HAND_SIZE;
  }
  const faceUp = pool[cursor];
  cursor += 1;
  const drawPile = pool.slice(cursor);

  return {
    seats,
    names,
    target,
    roundNumber,
    jokerRank,
    drawPile,
    discardPile: [faceUp],
    hands,
    scores,
    turn: seats[(roundNumber - 1) % seats.length],
    phase: 'awaiting-action',
    pendingPickup: null,
    lastRoundResult: null,
    winner: null,
  };
}

export function newMultiplayerGame(seats: string[], names: Record<string, string>, target: number): MPGameState {
  const scores = Object.fromEntries(seats.map((seat) => [seat, 0]));
  return dealRound(seats, names, target, scores, 1);
}

export function startNextRound(state: MPGameState): MPGameState {
  return dealRound(state.seats, state.names, state.target, state.scores, state.roundNumber + 1);
}

export function canAct(state: MPGameState, playerId: string): boolean {
  return state.turn === playerId && state.phase === 'awaiting-action';
}

export function canPlayCards(state: MPGameState, playerId: string, cardIds: string[]): boolean {
  if (!canAct(state, playerId) || cardIds.length === 0) return false;
  const hand = state.hands[playerId];
  const cards = cardIds.map((id) => hand.find((c) => c.id === id));
  if (cards.some((c) => !c)) return false;
  const rank = cards[0]!.rank;
  return cards.every((c) => c!.rank === rank);
}

export function playCards(state: MPGameState, playerId: string, cardIds: string[]): MPGameState {
  if (!canPlayCards(state, playerId, cardIds)) return state;

  const hand = state.hands[playerId];
  const played = hand.filter((c) => cardIds.includes(c.id));
  const remainingHand = hand.filter((c) => !cardIds.includes(c.id));
  const previousTop = state.discardPile[state.discardPile.length - 1] ?? null;
  const matched = previousTop !== null && previousTop.rank === played[0].rank;

  const discardPile = [...state.discardPile, ...played];
  const hands = { ...state.hands, [playerId]: remainingHand };

  if (matched) {
    return {
      ...state,
      hands,
      discardPile,
      turn: nextSeat(state.seats, playerId),
      phase: 'awaiting-action',
      pendingPickup: null,
    };
  }

  return {
    ...state,
    hands,
    discardPile,
    phase: 'awaiting-replacement-draw',
    pendingPickup: previousTop,
  };
}

export function canDrawReplacement(state: MPGameState, playerId: string): boolean {
  return state.turn === playerId && state.phase === 'awaiting-replacement-draw';
}

export function drawReplacement(state: MPGameState, playerId: string, source: 'deck' | 'pickup'): MPGameState {
  if (!canDrawReplacement(state, playerId)) return state;

  if (source === 'pickup') {
    const pickup = state.pendingPickup;
    if (!pickup) return state;
    return {
      ...state,
      hands: { ...state.hands, [playerId]: [...state.hands[playerId], pickup] },
      discardPile: state.discardPile.filter((c) => c.id !== pickup.id),
      turn: nextSeat(state.seats, playerId),
      phase: 'awaiting-action',
      pendingPickup: null,
    };
  }

  const { card, drawPile, discardPile } = drawFromPile(state.drawPile, state.discardPile);
  return {
    ...state,
    drawPile,
    discardPile,
    hands: { ...state.hands, [playerId]: [...state.hands[playerId], card] },
    turn: nextSeat(state.seats, playerId),
    phase: 'awaiting-action',
    pendingPickup: null,
  };
}

export function call(state: MPGameState, caller: string): MPGameState {
  if (!canAct(state, caller)) return state;

  const values: Record<string, number> = {};
  for (const seat of state.seats) values[seat] = handValue(state.hands[seat], state.jokerRank);

  const lowest = Math.min(...state.seats.map((seat) => values[seat]));
  const correct = values[caller] === lowest;

  const pointsAwarded: Record<string, number> = Object.fromEntries(state.seats.map((seat) => [seat, 0]));
  if (correct) {
    for (const seat of state.seats) {
      if (seat !== caller) pointsAwarded[seat] = values[seat];
    }
  } else {
    pointsAwarded[caller] = INCORRECT_CALL_PENALTY;
  }

  const scores: Record<string, number> = {};
  for (const seat of state.seats) scores[seat] = state.scores[seat] + pointsAwarded[seat];

  const roundResult: MPRoundResult = {
    caller,
    correct,
    jokerRank: state.jokerRank,
    hands: Object.fromEntries(state.seats.map((seat) => [seat, state.hands[seat]])),
    values,
    pointsAwarded,
  };

  const reachedTarget = state.seats.some((seat) => scores[seat] >= state.target);
  let winner: string | null = null;
  if (reachedTarget) {
    const minScore = Math.min(...state.seats.map((seat) => scores[seat]));
    const winners = state.seats.filter((seat) => scores[seat] === minScore);
    if (winners.length === 1) winner = winners[0];
  }

  return {
    ...state,
    scores,
    lastRoundResult: roundResult,
    phase: reachedTarget && winner ? 'game-over' : 'round-end',
    winner,
  };
}
