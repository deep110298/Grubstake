import { LEVELS_PER_WORLD, TOTAL_LEVELS } from './storyLevels';

const STORAGE_KEY = 'leastcount_story_progress_v1';

export type Stars = 0 | 1 | 2 | 3;

interface StoryProgressData {
  // The furthest globalId ever unlocked — level 1 is always unlocked.
  // TOTAL_LEVELS + 1 means every level has been cleared.
  furthestUnlocked: number;
  stars: Record<number, Stars>;
}

const DEFAULT_DATA: StoryProgressData = { furthestUnlocked: 1, stars: {} };

function load(): StoryProgressData {
  if (typeof window === 'undefined') return DEFAULT_DATA;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DATA;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_DATA, ...parsed, stars: parsed.stars ?? {} };
  } catch {
    return DEFAULT_DATA;
  }
}

function save(data: StoryProgressData) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage can be unavailable (private browsing, quota) — losing locally
    // tracked story progress isn't fatal, so just skip persisting it.
  }
}

export function getFurthestUnlocked(): number {
  return load().furthestUnlocked;
}

export function isLevelUnlocked(globalId: number): boolean {
  return globalId <= load().furthestUnlocked;
}

export function getStars(globalId: number): Stars {
  return load().stars[globalId] ?? 0;
}

export function getTotalStars(): number {
  const data = load();
  return Object.values(data.stars).reduce((sum: number, s) => sum + s, 0);
}

// A world counts as cleared once its last level's win has unlocked the
// first level of the next world (or, for the final world, once every level
// up to TOTAL_LEVELS is behind the furthest-unlocked marker).
export function isWorldCleared(world: number): boolean {
  return load().furthestUnlocked > world * LEVELS_PER_WORLD;
}

export function isWorldUnlocked(world: number): boolean {
  return load().furthestUnlocked >= (world - 1) * LEVELS_PER_WORLD + 1;
}

// Idempotent: recording the same win twice (e.g. a Strict Mode double
// lazy-init) just recomputes the same max()-based values, never double-counts.
export function recordLevelResult(
  globalId: number,
  won: boolean,
  stars: Stars
): { starsImproved: boolean; newlyUnlocked: boolean } {
  const data = load();
  const prevStars = data.stars[globalId] ?? 0;
  const nextStars = won ? (Math.max(prevStars, stars) as Stars) : prevStars;
  const nextFurthest = won ? Math.min(Math.max(data.furthestUnlocked, globalId + 1), TOTAL_LEVELS + 1) : data.furthestUnlocked;

  save({
    furthestUnlocked: nextFurthest,
    stars: { ...data.stars, [globalId]: nextStars },
  });

  return {
    starsImproved: nextStars > prevStars,
    newlyUnlocked: nextFurthest > data.furthestUnlocked,
  };
}

export function computeStars(playerScore: number, target: number): Stars {
  const ratio = playerScore / target;
  if (ratio <= 0.25) return 3;
  if (ratio <= 0.6) return 2;
  return 1;
}
