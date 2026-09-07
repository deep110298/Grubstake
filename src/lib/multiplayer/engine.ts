import { createDeck, decksForPlayerCount, handValue, shuffle } from './deck';
import { drawFromPile } from '@/lib/leastCount/deck';
import type { Rank } from '@/lib/leastCount/types';
import type { MPGameState, MPRoundResult } from './types';

export const HAND_SIZE = 7;
export const INCORRECT_CALL_PENALTY = 40;
export const DECLARE_THRESHOLD = 10;

/*
 * A friends-multiplayer implementation of Least Count for 2-6 players,
 * matching the commonly-played rules (see sohels.medium.com/how-to-play-
 * least-count-905519066ef4), which is a different — and for 3+ players,
 * more complete — ruleset than ckoppula199's 2-player source the
 * vs-computer mode (src/lib/leastCount/) is built from. The two engines
 * are intentionally independent: different hand size, card values, and
 * calling/scoring rules.
 */

function nextSeat(activeSeats: string[], current: string): string {
  const index = activeSeats.indexOf(current);
  return activeSeats[(index + 1) % activeSeats.length];
}

function dealRound(
  seats: string[],
  activeSeats: string[],
  eliminated: string[],
  names: Record<string, string>,
  target: number,
  scores: Record<string, number>,
  roundNumber: number
): MPGameState {
  const numDecks = decksForPlayerCount(seats.length);
  const deck = shuffle(createDeck(numDecks));

  // Reveal a card to fix this round's wild rank; if the reveal is itself a
  // Joker (which has no rank of its own), the wild rank defaults to Ace.
  const revealIndex = Math.floor(Math.random() * deck.length);
  const revealed = deck[revealIndex];
  const jokerRank: Rank = revealed.rank === 'JOKER' ? 'A' : revealed.rank;
  const pool = [...deck.slice(0, revealIndex), ...deck.slice(revealIndex + 1)];

  const hands: Record<string, typeof pool> = {};
  let cursor = 0;
  for (const seat of activeSeats) {
    hands[seat] = pool.slice(cursor, cursor + HAND_SIZE);
    cursor += HAND_SIZE;
  }
  const faceUp = pool[cursor];
  cursor += 1;
  const drawPile = pool.slice(cursor);

  return {
    seats,
    activeSeats,
    eliminated,
    names,
    target,
    roundNumber,
    jokerRank,
    drawPile,
    discardPile: [faceUp],
    hands,
    scores,
    turn: activeSeats[(roundNumber - 1) % activeSeats.length],
    phase: 'awaiting-action',
    pendingPickup: null,
    lastRoundResult: null,
    winner: null,
  };
}

export function newMultiplayerGame(seats: string[], names: Record<string, string>, target: number): MPGameState {
  const scores = Object.fromEntries(seats.map((seat) => [seat, 0]));
  return dealRound(seats, seats, [], names, target, scores, 1);
}

export function startNextRound(state: MPGameState): MPGameState {
  return dealRound(state.seats, state.activeSeats, state.eliminated, state.names, state.target, state.scores, state.roundNumber + 1);
}

export function canAct(state: MPGameState, playerId: string): boolean {
  return state.turn === playerId && state.phase === 'awaiting-action';
}

// You may only call once your hand totals DECLARE_THRESHOLD or less.
export function canCall(state: MPGameState, playerId: string): boolean {
  return canAct(state, playerId) && handValue(state.hands[playerId] ?? [], state.jokerRank) <= DECLARE_THRESHOLD;
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
      turn: nextSeat(state.activeSeats, playerId),
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
      turn: nextSeat(state.activeSeats, playerId),
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
    turn: nextSeat(state.activeSeats, playerId),
    phase: 'awaiting-action',
    pendingPickup: null,
  };
}

export function call(state: MPGameState, caller: string): MPGameState {
  if (!canCall(state, caller)) return state;

  const participants = state.activeSeats;
  const values: Record<string, number> = {};
  for (const seat of participants) values[seat] = handValue(state.hands[seat], state.jokerRank);

  // The caller must be strictly the lowest — an exact tie counts against them.
  const othersMin = Math.min(...participants.filter((s) => s !== caller).map((s) => values[s]));
  const correct = values[caller] < othersMin;

  const pointsAwarded: Record<string, number> = Object.fromEntries(participants.map((seat) => [seat, 0]));
  if (correct) {
    for (const seat of participants) {
      if (seat !== caller) pointsAwarded[seat] = values[seat];
    }
  } else {
    pointsAwarded[caller] = INCORRECT_CALL_PENALTY;
  }

  const scores: Record<string, number> = { ...state.scores };
  for (const seat of participants) scores[seat] += pointsAwarded[seat];

  const roundResult: MPRoundResult = {
    participants,
    caller,
    correct,
    jokerRank: state.jokerRank,
    hands: Object.fromEntries(participants.map((seat) => [seat, state.hands[seat]])),
    values,
    pointsAwarded,
  };

  // Anyone who reached the target this round stops playing; the rest
  // continue next round. Once only one player is left, they win.
  const busted = participants.filter((seat) => scores[seat] >= state.target);
  const activeSeats = participants.filter((seat) => !busted.includes(seat));
  const eliminated = [...state.eliminated, ...busted];
  const winner = activeSeats.length === 1 ? activeSeats[0] : null;

  return {
    ...state,
    scores,
    activeSeats,
    eliminated,
    lastRoundResult: roundResult,
    phase: winner ? 'game-over' : 'round-end',
    winner,
  };
}
