'use client';

import { useEffect, useState } from 'react';
import { dailyComputerName, dayNumber, newDailyGame, todayKey } from '@/lib/leastCount/dailyChallenge';
import { getLastResult, hasPlayedToday } from '@/lib/leastCount/dailyStreak';
import { getSavedPlayerName } from '@/lib/playerName';
import DailyResultModal from './DailyResultModal';
import GameBoard from './GameBoard';

interface TodayInfo {
  dateKey: string;
  day: number;
  alreadyPlayed: boolean;
  lastResult: ReturnType<typeof getLastResult>;
  playerName: string;
  computerName: string;
  state: ReturnType<typeof newDailyGame>;
}

// "Today" depends on the player's own local clock and localStorage, neither
// of which the server can know — computing it during SSR would risk a
// hydration mismatch (or worse, the wrong day's deal) for anyone whose
// timezone differs from the server's. So this is deliberately built
// client-side only, after mount, same as Friends mode's room-loading state.
function buildTodayInfo(): TodayInfo {
  const dateKey = todayKey();
  return {
    dateKey,
    day: dayNumber(dateKey),
    alreadyPlayed: hasPlayedToday(dateKey),
    lastResult: getLastResult(dateKey),
    playerName: getSavedPlayerName() || 'You',
    computerName: dailyComputerName(dateKey),
    state: newDailyGame(dateKey),
  };
}

export default function DailyChallengeBoard() {
  const [today, setToday] = useState<TodayInfo | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setToday(buildTodayInfo()), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!today) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-canvas text-sm text-ink-muted">
        Loading today&apos;s challenge…
      </div>
    );
  }

  if (today.alreadyPlayed && today.lastResult) {
    return (
      <div className="flex min-h-dvh flex-col bg-canvas">
        <DailyResultModal
          dateKey={today.lastResult.dateKey}
          day={today.lastResult.dayNumber}
          rival={today.lastResult.rival}
          rounds={today.lastResult.rounds}
          result={today.lastResult.result}
        />
      </div>
    );
  }

  return (
    <GameBoard
      daily={{
        state: today.state,
        playerName: today.playerName,
        computerName: today.computerName,
        dateKey: today.dateKey,
        day: today.day,
      }}
    />
  );
}
