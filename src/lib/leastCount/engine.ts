import { createDeck, drawFromPile, handValue, shuffle } from './deck';
import type { GameState, PlayerId, Rank, RoundResult } from './types';

export const HAND_SIZE = 5;
export const INCORRECT_CALL_PENALTY = 40;
export const DECLARE_THRESHOLD = 10;

const OTHER: Record<PlayerId, PlayerId> = { player: 'computer', computer: 'player' };

function dealRound(
  target: number,
  scores: Record<PlayerId, number>,
  roundNumber: number,
  rng: () => number = Math.random
): GameState {
  const deck = shuffle(createDeck(), rng);

  // One card is drawn out of the deck to fix the joker rank for the round —
  // that specific card is set aside and isn't dealt or drawn this round.
  const jokerIndex = Math.floor(rng() * deck.length);
  const jokerRank: Rank = deck[jokerIndex].rank;
  const pool = [...deck.slice(0, jokerIndex), ...deck.slice(jokerIndex + 1)];

  const playerHand = pool.slice(0, HAND_SIZE);
  const computerHand = pool.slice(HAND_SIZE, HAND_SIZE * 2);
  const faceUp = pool[HAND_SIZE * 2];
  const drawPile = pool.slice(HAND_SIZE * 2 + 1);

  return {
    target,
    roundNumber,
    jokerRank,
    drawPile,
    discardPile: [faceUp],
    hands: { player: playerHand, computer: computerHand },
    scores,
    turn: roundNumber % 2 === 1 ? 'player' : 'computer',
    phase: 'awaiting-action',
    pendingPickup: null,
    lastRoundResult: null,
    winner: null,
  };
}

export function newGame(target: number, rng?: () => number): GameState {
  return dealRound(target, { player: 0, computer: 0 }, 1, rng);
}

export function startNextRound(state: GameState): GameState {
  return dealRound(state.target, state.scores, state.roundNumber + 1);
}

export function canAct(state: GameState, playerId: PlayerId): boolean {
  return state.turn === playerId && state.phase === 'awaiting-action';
}

export function canPlayCards(state: GameState, playerId: PlayerId, cardIds: string[]): boolean {
  if (!canAct(state, playerId) || cardIds.length === 0) return false;
  const hand = state.hands[playerId];
  const cards = cardIds.map((id) => hand.find((c) => c.id === id));
  if (cards.some((c) => !c)) return false;
  const rank = cards[0]!.rank;
  return cards.every((c) => c!.rank === rank);
}

// Plays one or more same-rank cards from hand onto the discard pile. If
// their rank matches the pile's current top card, the turn ends immediately
// and the hand shrinks. Otherwise a replacement draw is required next.
export function playCards(state: GameState, playerId: PlayerId, cardIds: string[]): GameState {
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
      turn: OTHER[playerId],
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

export function canDrawReplacement(state: GameState, playerId: PlayerId): boolean {
  return state.turn === playerId && state.phase === 'awaiting-replacement-draw';
}

// Completes a turn that needs a replacement card: either a blind draw from
// the deck, or taking the specific card that was on top of the discard pile
// before this turn's card(s) were played.
export function drawReplacement(state: GameState, playerId: PlayerId, source: 'deck' | 'pickup'): GameState {
  if (!canDrawReplacement(state, playerId)) return state;

  if (source === 'pickup') {
    const pickup = state.pendingPickup;
    if (!pickup) return state;
    return {
      ...state,
      hands: { ...state.hands, [playerId]: [...state.hands[playerId], pickup] },
      discardPile: state.discardPile.filter((c) => c.id !== pickup.id),
      turn: OTHER[playerId],
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
    turn: OTHER[playerId],
    phase: 'awaiting-action',
    pendingPickup: null,
  };
}

// You may only declare when your hand's value is 10 or less.
export function canCall(state: GameState, playerId: PlayerId): boolean {
  return canAct(state, playerId) && handValue(state.hands[playerId], state.jokerRank) <= DECLARE_THRESHOLD;
}

export function call(state: GameState, caller: PlayerId): GameState {
  if (!canCall(state, caller)) return state;

  const values: Record<PlayerId, number> = {
    player: handValue(state.hands.player, state.jokerRank),
    computer: handValue(state.hands.computer, state.jokerRank),
  };

  // A hand that ties the opponent's is scored as a computer win.
  const roundWinner: PlayerId = values.player >= values.computer ? 'computer' : 'player';
  const correct = caller === roundWinner;

  const pointsAwarded: Record<PlayerId, number> = { player: 0, computer: 0 };
  if (correct) {
    const loser = OTHER[caller];
    pointsAwarded[loser] = values[loser];
  } else {
    pointsAwarded[caller] = INCORRECT_CALL_PENALTY;
  }

  const roundResult: RoundResult = {
    caller,
    correct,
    jokerRank: state.jokerRank,
    hands: { player: state.hands.player, computer: state.hands.computer },
    values,
    pointsAwarded,
  };

  const scores: Record<PlayerId, number> = {
    player: state.scores.player + pointsAwarded.player,
    computer: state.scores.computer + pointsAwarded.computer,
  };

  const reachedTarget = scores.player >= state.target || scores.computer >= state.target;
  let winner: PlayerId | null = null;
  if (reachedTarget && scores.player !== scores.computer) {
    winner = scores.player < scores.computer ? 'player' : 'computer';
  }

  return {
    ...state,
    scores,
    lastRoundResult: roundResult,
    phase: reachedTarget && winner ? 'game-over' : 'round-end',
    winner,
  };
}
