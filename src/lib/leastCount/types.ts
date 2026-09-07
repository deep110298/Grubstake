export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';

export type Rank =
  | 'A'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | 'J'
  | 'Q'
  | 'K';

export interface PlayingCard {
  id: string;
  suit: Suit;
  rank: Rank;
}

export type PlayerId = 'player' | 'computer';

export type Phase =
  | 'awaiting-action' // start of a turn: play card(s) from hand, or call
  | 'awaiting-replacement-draw' // played card(s) didn't match the pile — must draw a replacement
  | 'round-end'
  | 'game-over';

export interface RoundResult {
  caller: PlayerId;
  correct: boolean;
  jokerRank: Rank;
  hands: Record<PlayerId, PlayingCard[]>;
  values: Record<PlayerId, number>;
  pointsAwarded: Record<PlayerId, number>;
}

export interface GameState {
  target: number;
  roundNumber: number;
  jokerRank: Rank;
  drawPile: PlayingCard[];
  discardPile: PlayingCard[]; // last element is the face-up top card
  hands: Record<PlayerId, PlayingCard[]>;
  scores: Record<PlayerId, number>;
  turn: PlayerId;
  phase: Phase;
  // The card that was on top of the discard pile before the current
  // player's card(s) were played — offered as a known-value alternative to
  // a blind draw while phase is 'awaiting-replacement-draw'.
  pendingPickup: PlayingCard | null;
  lastRoundResult: RoundResult | null;
  winner: PlayerId | null;
}
