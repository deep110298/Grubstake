import type { Difficulty } from './ai';

export const LEVELS_PER_WORLD = 20;
export const WORLD_COUNT = 25;
export const TOTAL_LEVELS = WORLD_COUNT * LEVELS_PER_WORLD;

// One evocative word per world — shown as "World 3 — Bluff" rather than a
// bare number, since 25 worlds of just "World N" would read as filler.
const WORLD_NAMES = [
  'Ante', 'Shuffle', 'Bluff', 'Draw', 'Discard', 'Wildcard', 'Showdown', 'Cut',
  'Deal', 'Fold', 'Stakes', 'Gambit', 'Trump', 'Parlay', 'Riffle', 'Sleight',
  'Reshuffle', 'High Roller', 'All In', 'Poker Face', 'Card Sharp', 'Royal Flush',
  'Dead Man’s Hand', 'Final Table', 'Grand Slam',
];

export function worldName(world: number): string {
  return WORLD_NAMES[world - 1] ?? `World ${world}`;
}

export function worldOf(globalId: number): number {
  return Math.floor((globalId - 1) / LEVELS_PER_WORLD) + 1;
}

export function levelInWorldOf(globalId: number): number {
  return ((globalId - 1) % LEVELS_PER_WORLD) + 1;
}

export function globalIdOf(world: number, levelInWorld: number): number {
  return (world - 1) * LEVELS_PER_WORLD + levelInWorld;
}

function difficultyForWorld(world: number): Difficulty {
  if (world === 1) return 'easy';
  if (world === 2) return 'medium';
  return 'hard';
}

// How far past the 'hard' AI preset a world's computer plays, ramping from
// 0 at world 3 up to 1.2 at world 25 — see computerTakeTurn's strengthBonus.
function aiStrengthBonusForWorld(world: number): number {
  if (world < 3) return 0;
  const hardWorldCount = WORLD_COUNT - 2;
  return ((world - 3) / (hardWorldCount - 1)) * 1.2;
}

// The "play to" target score gets both lower (less room to recover from a
// bad round) and, within a world, tighter from its first level to its last.
function targetRangeForWorld(world: number): { floor: number; ceiling: number } {
  if (world === 1) return { floor: 110, ceiling: 150 };
  if (world === 2) return { floor: 60, ceiling: 100 };
  const floor = Math.max(45, 70 - (world - 3));
  return { floor, ceiling: floor + 20 };
}

export interface StoryLevelConfig {
  globalId: number;
  world: number;
  levelInWorld: number;
  target: number;
  difficulty: Difficulty;
  aiStrengthBonus: number;
}

export function getLevelConfig(globalId: number): StoryLevelConfig {
  const world = worldOf(globalId);
  const levelInWorld = levelInWorldOf(globalId);
  const { floor, ceiling } = targetRangeForWorld(world);
  const t = (levelInWorld - 1) / (LEVELS_PER_WORLD - 1);
  const target = Math.round(ceiling - t * (ceiling - floor));
  return {
    globalId,
    world,
    levelInWorld,
    target,
    difficulty: difficultyForWorld(world),
    aiStrengthBonus: aiStrengthBonusForWorld(world),
  };
}

export function getWorldLevels(world: number): StoryLevelConfig[] {
  const levels: StoryLevelConfig[] = [];
  for (let levelInWorld = 1; levelInWorld <= LEVELS_PER_WORLD; levelInWorld++) {
    levels.push(getLevelConfig(globalIdOf(world, levelInWorld)));
  }
  return levels;
}
