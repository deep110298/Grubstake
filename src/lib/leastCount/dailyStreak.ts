import { addDaysToKey, dayNumber, todayKey } from './dailyChallenge';

const STORAGE_KEY = 'leastcount_daily_streak_v1';
const HISTORY_KEEP_DAYS = 30;

export type DailyOutcome = 'win' | 'loss';

export interface DailyResultSummary {
  dateKey: string;
  dayNumber: number;
  rival: string;
  rounds: number;
  result: DailyOutcome;
}

interface DailyStreakData {
  lastPlayedDate: string | null;
  currentStreak: number;
  bestStreak: number;
  history: Record<string, DailyOutcome>;
  lastResult: DailyResultSummary | null;
}

const DEFAULT_DATA: DailyStreakData = {
  lastPlayedDate: null,
  currentStreak: 0,
  bestStreak: 0,
  history: {},
  lastResult: null,
};

function load(): DailyStreakData {
  if (typeof window === 'undefined') return DEFAULT_DATA;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DATA;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_DATA, ...parsed, history: parsed.history ?? {} };
  } catch {
    return DEFAULT_DATA;
  }
}

function save(data: DailyStreakData) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage can be unavailable (private browsing, quota) — losing the
    // locally-tracked streak isn't fatal, so just skip persisting it.
  }
}

function trimHistory(history: Record<string, DailyOutcome>, aroundDateKey: string): Record<string, DailyOutcome> {
  const cutoff = addDaysToKey(aroundDateKey, -HISTORY_KEEP_DAYS);
  const trimmed: Record<string, DailyOutcome> = {};
  for (const [key, value] of Object.entries(history)) {
    if (key >= cutoff) trimmed[key] = value;
  }
  return trimmed;
}

export function hasPlayedToday(dateKey: string = todayKey()): boolean {
  return load().lastPlayedDate === dateKey;
}

// The streak shown in the UI: a gap of more than one day silently breaks it
// on read, even before the player has attempted today's challenge — they
// shouldn't see yesterday's streak count still standing on a day they
// skipped entirely.
export function getEffectiveStreak(dateKey: string = todayKey()): number {
  const data = load();
  if (!data.lastPlayedDate) return 0;
  const yesterday = addDaysToKey(dateKey, -1);
  if (data.lastPlayedDate === dateKey || data.lastPlayedDate === yesterday) {
    return data.currentStreak;
  }
  return 0;
}

export function getBestStreak(): number {
  return load().bestStreak;
}

export function getLast7Days(
  dateKey: string = todayKey()
): { dateKey: string; result: DailyOutcome | null; isToday: boolean }[] {
  const data = load();
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const key = addDaysToKey(dateKey, -i);
    days.push({ dateKey: key, result: data.history[key] ?? null, isToday: key === dateKey });
  }
  return days;
}

export function getLastResult(dateKey: string = todayKey()): DailyResultSummary | null {
  const data = load();
  return data.lastPlayedDate === dateKey ? data.lastResult : null;
}

// Idempotent per date — recording twice for the same day (e.g. a re-render,
// or a revisit after the day was already completed) never double-counts
// the streak, and just returns the same result both times. This lets a
// result screen call it unconditionally, whether it's showing a match that
// just finished or one the player already completed earlier today.
export function recordDailyResult(input: {
  dateKey: string;
  rival: string;
  rounds: number;
  result: DailyOutcome;
}): { streak: number; bestStreak: number } {
  const data = load();
  if (data.lastPlayedDate === input.dateKey) {
    return { streak: data.currentStreak, bestStreak: data.bestStreak };
  }

  const yesterday = addDaysToKey(input.dateKey, -1);
  const continuesStreak = data.lastPlayedDate === yesterday;
  const nextStreak = input.result === 'win' ? (continuesStreak ? data.currentStreak + 1 : 1) : 0;
  const nextBest = Math.max(data.bestStreak, nextStreak);

  save({
    lastPlayedDate: input.dateKey,
    currentStreak: nextStreak,
    bestStreak: nextBest,
    history: trimHistory({ ...data.history, [input.dateKey]: input.result }, input.dateKey),
    lastResult: {
      dateKey: input.dateKey,
      dayNumber: dayNumber(input.dateKey),
      rival: input.rival,
      rounds: input.rounds,
      result: input.result,
    },
  });

  return { streak: nextStreak, bestStreak: nextBest };
}
