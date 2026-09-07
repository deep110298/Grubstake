import { shuffle } from '@/lib/leastCount/deck';
import type { PlayingCard, Rank, Suit } from '@/lib/leastCount/types';

const SUITS: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// 2 players play with a single deck (52 cards + 1 Joker); 3+ play with two
// decks shuffled together (104 cards + 2 Jokers).
export function decksForPlayerCount(playerCount: number): number {
  return playerCount <= 2 ? 1 : 2;
}

export function createDeck(numDecks: number): PlayingCard[] {
  const deck: PlayingCard[] = [];
  for (let copy = 0; copy < numDecks; copy++) {
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        deck.push({ id: `${rank}-${suit}-${copy}`, suit, rank });
      }
    }
    deck.push({ id: `JOKER-${copy}`, suit: 'spades', rank: 'JOKER' });
  }
  return deck;
}

export { shuffle };

// Aces count as 1, face cards (J/Q/K) as 10, number cards their face value.
// A physical Joker card is always 0.
export function baseCardValue(rank: Rank): number {
  if (rank === 'JOKER') return 0;
  if (rank === 'A') return 1;
  if (rank === 'J' || rank === 'Q' || rank === 'K') return 10;
  return parseInt(rank, 10);
}

// Any card matching the round's wild rank is also worth zero, on top of a
// physical Joker always being zero.
export function cardValue(card: PlayingCard, jokerRank: Rank): number {
  if (card.rank === 'JOKER' || card.rank === jokerRank) return 0;
  return baseCardValue(card.rank);
}

export function handValue(hand: PlayingCard[], jokerRank: Rank): number {
  return hand.reduce((sum, card) => sum + cardValue(card, jokerRank), 0);
}

export function sortHand(hand: PlayingCard[]): PlayingCard[] {
  return [...hand].sort((a, b) => {
    if (a.rank === 'JOKER' && b.rank === 'JOKER') return 0;
    if (a.rank === 'JOKER') return 1;
    if (b.rank === 'JOKER') return -1;
    if (a.suit !== b.suit) return SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit);
    return RANKS.indexOf(a.rank) - RANKS.indexOf(b.rank);
  });
}
