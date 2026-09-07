import { createDeck, handValue, shuffle } from './deck';
import type { GameState, PlayerId, PlayingCard, Rank, RoundResult } from './types';

export const HAND_SIZE = 5;
export const INCORRECT_CALL_PENALTY = 40;

const OTHER: Record<PlayerId, PlayerId> = { player: 'computer', computer: 'player' };

function dealRound(target: number, scores: Record<PlayerId, number>, roundNumber: number): GameState {
  const deck = shuffle(createDeck());
  const jokerRank: Rank = deck[Math.floor(Math.random() * deck.length)].rank;

  const playerHand = deck.slice(0, HAND_SIZE);
  const computerHand = deck.slice(HAND_SIZE, HAND_SIZE * 2);
  const faceUp = deck[HAND_SIZE * 2];
  const drawPile = deck.slice(HAND_SIZE * 2 + 1);

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
    lastRoundResult: null,
    winner: null,
  };
}

export function newGame(target: number): GameState {
  return dealRound(target, { player: 0, computer: 0 }, 1);
}

export function startNextRound(state: GameState): GameState {
  return dealRound(state.target, state.scores, state.roundNumber + 1);
}

// Draws the top card of the draw pile, reshuffling the discard pile
// (keeping its top card in play) if the draw pile has run out.
function takeFromDrawPile(state: GameState): { card: PlayingCard; drawPile: PlayingCard[]; discardPile: PlayingCard[] } {
  let drawPile = state.drawPile;
  let discardPile = state.discardPile;

  if (drawPile.length === 0) {
    const topCard = discardPile[discardPile.length - 1];
    drawPile = shuffle(discardPile.slice(0, -1));
    discardPile = [topCard];
  }

  const [card, ...rest] = drawPile;
  return { card, drawPile: rest, discardPile };
}

export function canAct(state: GameState, playerId: PlayerId): boolean {
  return state.turn === playerId && state.phase === 'awaiting-action';
}

export function canDiscard(state: GameState, playerId: PlayerId): boolean {
  return state.turn === playerId && state.phase === 'awaiting-discard';
}

export function drawFromDeck(state: GameState, playerId: PlayerId): GameState {
  if (!canAct(state, playerId)) return state;
  const { card, drawPile, discardPile } = takeFromDrawPile(state);
  return {
    ...state,
    drawPile,
    discardPile,
    hands: { ...state.hands, [playerId]: [...state.hands[playerId], card] },
    phase: 'awaiting-discard',
  };
}

export function drawFromDiscard(state: GameState, playerId: PlayerId): GameState {
  if (!canAct(state, playerId) || state.discardPile.length === 0) return state;
  const card = state.discardPile[state.discardPile.length - 1];
  const discardPile = state.discardPile.slice(0, -1);
  return {
    ...state,
    discardPile,
    hands: { ...state.hands, [playerId]: [...state.hands[playerId], card] },
    phase: 'awaiting-discard',
  };
}

export function discardCard(state: GameState, playerId: PlayerId, cardId: string): GameState {
  if (!canDiscard(state, playerId)) return state;
  const hand = state.hands[playerId];
  const card = hand.find((c) => c.id === cardId);
  if (!card) return state;

  return {
    ...state,
    hands: { ...state.hands, [playerId]: hand.filter((c) => c.id !== cardId) },
    discardPile: [...state.discardPile, card],
    turn: OTHER[playerId],
    phase: 'awaiting-action',
  };
}

// A player holding two or more cards of the same rank may discard all of
// them at once, drawing a single replacement card to finish their turn.
export function canPlaySet(state: GameState, playerId: PlayerId, cardIds: string[]): boolean {
  if (!canAct(state, playerId) || cardIds.length < 2) return false;
  const hand = state.hands[playerId];
  const cards = cardIds.map((id) => hand.find((c) => c.id === id)).filter((c): c is PlayingCard => !!c);
  if (cards.length !== cardIds.length) return false;
  return cards.every((c) => c.rank === cards[0].rank);
}

export function playSet(state: GameState, playerId: PlayerId, cardIds: string[]): GameState {
  if (!canPlaySet(state, playerId, cardIds)) return state;
  const hand = state.hands[playerId];
  const remainingHand = hand.filter((c) => !cardIds.includes(c.id));
  const playedCards = hand.filter((c) => cardIds.includes(c.id));

  const { card, drawPile, discardPile } = takeFromDrawPile({
    ...state,
    discardPile: [...state.discardPile, ...playedCards],
  });

  return {
    ...state,
    drawPile,
    discardPile,
    hands: { ...state.hands, [playerId]: [...remainingHand, card] },
    turn: OTHER[playerId],
    phase: 'awaiting-action',
  };
}

export function call(state: GameState, playerId: PlayerId): GameState {
  if (!canAct(state, playerId)) return state;

  const values: Record<PlayerId, number> = {
    player: handValue(state.hands.player, state.jokerRank),
    computer: handValue(state.hands.computer, state.jokerRank),
  };

  const opponent = OTHER[playerId];
  const correct = values[playerId] <= values[opponent];

  const pointsAwarded: Record<PlayerId, number> = correct
    ? { [playerId]: 0, [opponent]: values[opponent] } as Record<PlayerId, number>
    : { [playerId]: INCORRECT_CALL_PENALTY, [opponent]: values[opponent] } as Record<PlayerId, number>;

  const roundResult: RoundResult = {
    caller: playerId,
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
