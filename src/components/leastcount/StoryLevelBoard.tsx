'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { randomComputerName } from '@/lib/leastCount/computerNames';
import { newGame } from '@/lib/leastCount/engine';
import { getLevelConfig, type StoryLevelConfig } from '@/lib/leastCount/storyLevels';
import { isLevelUnlocked } from '@/lib/leastCount/storyProgress';
import { getSavedPlayerName } from '@/lib/playerName';
import type { GameState } from '@/lib/leastCount/types';
import GameBoard from './GameBoard';

interface LevelSetup {
  config: StoryLevelConfig;
  playerName: string;
  computerName: string;
  state: GameState;
}

// Progress (localStorage) and the level's shuffle both depend on the client
// only — building this during SSR risks a hydration mismatch, same reasoning
// as DailyChallengeBoard.
function buildLevelSetup(globalId: number): LevelSetup | null {
  if (!isLevelUnlocked(globalId)) return null;
  const config = getLevelConfig(globalId);
  const playerName = getSavedPlayerName() || 'You';
  return {
    config,
    playerName,
    computerName: randomComputerName(playerName),
    state: newGame(config.target),
  };
}

export default function StoryLevelBoard({ globalId }: { globalId: number }) {
  const [setup, setSetup] = useState<LevelSetup | null | undefined>(undefined);

  useEffect(() => {
    const timer = setTimeout(() => setSetup(buildLevelSetup(globalId)), 0);
    return () => clearTimeout(timer);
  }, [globalId]);

  if (setup === undefined) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-canvas text-sm text-ink-muted">Loading level…</div>
    );
  }

  if (setup === null) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-canvas px-6 text-center">
        <span className="text-4xl" aria-hidden>
          🔒
        </span>
        <p className="text-ink-muted">This level isn&apos;t unlocked yet.</p>
        <Link
          href="/play/story"
          className="rounded-2xl bg-wild px-5 py-3 text-center font-bold text-white shadow-[0_4px_0_var(--wild-shadow)] transition-transform active:translate-y-[2px] active:shadow-[0_2px_0_var(--wild-shadow)]"
        >
          Back to Story Mode
        </Link>
      </div>
    );
  }

  return (
    <GameBoard
      key={globalId}
      story={{
        state: setup.state,
        playerName: setup.playerName,
        computerName: setup.computerName,
        globalId,
        world: setup.config.world,
        levelInWorld: setup.config.levelInWorld,
        difficulty: setup.config.difficulty,
        aiStrengthBonus: setup.config.aiStrengthBonus,
      }}
    />
  );
}
