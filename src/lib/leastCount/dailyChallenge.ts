import type { Difficulty } from './ai';
import { COMPUTER_NAMES } from './computerNames';
import { newGame } from './engine';
import type { GameState } from './types';

export const DAILY_TARGET = 100;
export const DAILY_DIFFICULTY: Difficulty = 'medium';

// The first calendar day the daily challenge existed — "Day 1". Everything
// before it has no challenge to look back on.
const LAUNCH_DATE = '2026-09-09';

// A small, fast, deterministic PRNG (mulberry32) — good enough for shuffling
// a deck identically for every player on a given day, not for anything
// security-sensitive.
function mulberry32(seed: number): () => number {
  let state = seed;
  return function rng() {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (Math.imul(hash, 31) + input.charCodeAt(i)) | 0;
  }
  return hash;
}

// The player's local calendar date as YYYY-MM-DD — deliberately local, not
// UTC, so "today" matches what the clock on the player's own device says.
export function todayKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDaysToKey(dateKey: string, delta: number): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + delta);
  return todayKey(date);
}

// "Day N" shown in the UI — days since launch, 1-indexed.
export function dayNumber(dateKey: string): number {
  const [y1, m1, d1] = LAUNCH_DATE.split('-').map(Number);
  const [y2, m2, d2] = dateKey.split('-').map(Number);
  const launch = Date.UTC(y1, m1 - 1, d1);
  const target = Date.UTC(y2, m2 - 1, d2);
  return Math.round((target - launch) / 86_400_000) + 1;
}

// The round-1 deal (hands, wild card, draw/discard order) is identical for
// every player on the same calendar date — everything after that plays out
// normally based on each player's own choices, same as the crossword
// analogy: the puzzle is fixed, how you solve it isn't.
export function newDailyGame(dateKey: string): GameState {
  const rng = mulberry32(hashString(`${dateKey}:deal`));
  return newGame(DAILY_TARGET, rng);
}

export function dailyComputerName(dateKey: string): string {
  const rng = mulberry32(hashString(`${dateKey}:rival`));
  return COMPUTER_NAMES[Math.floor(rng() * COMPUTER_NAMES.length)];
}
