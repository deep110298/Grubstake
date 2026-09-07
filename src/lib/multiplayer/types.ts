import type { PlayingCard, Rank } from '@/lib/leastCount/types';

export type MPPhase =
  | 'awaiting-action'
  | 'awaiting-replacement-draw'
  | 'round-end'
  | 'game-over';

// Player ids here are the room player's stable `player_id` (a client-generated
// UUID), not seat numbers, so a reload can rejoin the same seat.
export interface MPRoundResult {
  participants: string[]; // seats that played this round, in order — may include a seat just eliminated by it
  caller: string;
  correct: boolean;
  jokerRank: Rank;
  hands: Record<string, PlayingCard[]>;
  values: Record<string, number>;
  pointsAwarded: Record<string, number>;
}

export interface MPGameState {
  seats: string[]; // the full, original roster — fixed for the whole game
  activeSeats: string[]; // seats still playing, in turn order (subset of seats)
  eliminated: string[]; // seats that have crossed the target and stopped playing
  names: Record<string, string>;
  target: number;
  roundNumber: number;
  jokerRank: Rank; // this round's wild rank (never 'JOKER' itself — see engine.ts)
  drawPile: PlayingCard[];
  discardPile: PlayingCard[];
  hands: Record<string, PlayingCard[]>;
  scores: Record<string, number>;
  turn: string;
  phase: MPPhase;
  pendingPickup: PlayingCard | null;
  lastRoundResult: MPRoundResult | null;
  winner: string | null;
}

export type RoomStatus = 'lobby' | 'playing' | 'finished';

export interface Room {
  code: string;
  host_player_id: string;
  max_players: number;
  target_score: number;
  status: RoomStatus;
  game_state: MPGameState | null;
  created_at: string;
  updated_at: string;
}

export interface RoomPlayerRow {
  id: string;
  room_code: string;
  player_id: string;
  name: string;
  seat_index: number;
  is_host: boolean;
  created_at: string;
}
