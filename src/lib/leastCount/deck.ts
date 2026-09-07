import type { PlayingCard, Rank, Suit } from './types';

export const SUITS: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
export const RANKS: Rank[] = [
  'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K',
];

export function createDeck(): PlayingCard[] {
  const deck: PlayingCard[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ id: `${rank}-${suit}`, suit, rank });
    }
  }
  return deck;
}

export function shuffle<T>(items: T[]): T[] {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Aces and face cards are worth 10, number cards keep their face value.
export function baseCardValue(rank: Rank): number {
  if (rank === 'A' || rank === 'J' || rank === 'Q' || rank === 'K') return 10;
  return parseInt(rank, 10);
}

// Any card matching the round's joker rank is worth zero.
export function cardValue(card: PlayingCard, jokerRank: Rank): number {
  return card.rank === jokerRank ? 0 : baseCardValue(card.rank);
}

export function handValue(hand: PlayingCard[], jokerRank: Rank): number {
  return hand.reduce((sum, card) => sum + cardValue(card, jokerRank), 0);
}

export function sortHand(hand: PlayingCard[]): PlayingCard[] {
  return [...hand].sort((a, b) => {
    if (a.suit !== b.suit) return SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit);
    return RANKS.indexOf(a.rank) - RANKS.indexOf(b.rank);
  });
}
