'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePlayerId } from '@/lib/multiplayer/playerId';
import {
  getRoom,
  getRoomPlayers,
  joinRoom,
  RoomServiceError,
  startGame,
  subscribeToRoom,
  updateGameState,
} from '@/lib/multiplayer/roomService';
import { newMultiplayerGame, startNextRound } from '@/lib/multiplayer/engine';
import type { MPGameState, Room, RoomPlayerRow } from '@/lib/multiplayer/types';
import Lobby from './Lobby';
import MultiplayerGameBoard from './MultiplayerGameBoard';

export default function RoomView({ code }: { code: string }) {
  const router = useRouter();
  const roomCode = code.toUpperCase();
  const myPlayerId = usePlayerId();

  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<RoomPlayerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joinName, setJoinName] = useState('');
  const [joining, setJoining] = useState(false);

  // Exposed via a ref so the join-room handler can trigger the same refresh
  // logic the mount effect defines, without making the effect depend on (and
  // synchronously call into) a function declared outside of it.
  const refreshRef = useRef<() => void>(() => {});

  useEffect(() => {
    let ignore = false;

    function load() {
      Promise.all([getRoom(roomCode), getRoomPlayers(roomCode)])
        .then(([nextRoom, nextPlayers]) => {
          if (ignore) return;
          setRoom(nextRoom);
          setPlayers(nextPlayers);
          if (!nextRoom) setError("This room doesn't exist anymore.");
        })
        .catch((err) => {
          if (ignore) return;
          setError(err instanceof RoomServiceError ? err.message : 'Something went wrong loading the room.');
        })
        .finally(() => {
          if (!ignore) setLoading(false);
        });
    }

    refreshRef.current = load;
    load();
    const unsubscribe = subscribeToRoom(roomCode, load);

    // Realtime can silently drop a connection (backgrounded tab, flaky
    // network) with no reconnect signal, leaving clients stuck on stale
    // state indefinitely. A periodic poll plus a refresh on regaining
    // visibility/connectivity makes the room self-heal within seconds
    // instead of requiring a manual reload.
    const pollInterval = setInterval(load, 4000);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') load();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('online', load);

    return () => {
      ignore = true;
      unsubscribe();
      clearInterval(pollInterval);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('online', load);
    };
  }, [roomCode]);

  async function handleJoin() {
    if (!joinName.trim()) return;
    setJoining(true);
    try {
      await joinRoom({ code: roomCode, playerId: myPlayerId, name: joinName.trim() });
      refreshRef.current();
    } catch (err) {
      setError(err instanceof RoomServiceError ? err.message : 'Could not join that room.');
    } finally {
      setJoining(false);
    }
  }

  async function handleStart() {
    if (!room) return;
    const seats = players.map((p) => p.player_id);
    const names = Object.fromEntries(players.map((p) => [p.player_id, p.name]));
    const initialState = newMultiplayerGame(seats, names, room.target_score);
    try {
      await startGame(roomCode, initialState);
    } catch (err) {
      setError(err instanceof RoomServiceError ? err.message : 'Could not start the game.');
    }
  }

  function handleUpdate(next: MPGameState): Promise<void> {
    return updateGameState(roomCode, next).catch((err) => {
      setError(err instanceof RoomServiceError ? err.message : 'Could not sync your move.');
      throw err;
    });
  }

  function handleNextRound() {
    if (!room?.game_state) return;
    handleUpdate(startNextRound(room.game_state)).catch(() => {});
  }

  function handlePlayAgain() {
    if (!room) return;
    const seats = players.map((p) => p.player_id);
    const names = Object.fromEntries(players.map((p) => [p.player_id, p.name]));
    const initialState = newMultiplayerGame(seats, names, room.target_score);
    startGame(roomCode, initialState).catch((err) => {
      setError(err instanceof RoomServiceError ? err.message : 'Could not start a new game.');
    });
  }

  if (loading || !myPlayerId) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-canvas text-sm text-ink-muted">Loading room…</div>
    );
  }

  if (!room) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-canvas px-4 text-center">
        <p className="text-sm text-ink-muted">{error ?? "This room doesn't exist."}</p>
        <button
          type="button"
          onClick={() => router.push('/play/friends')}
          className="rounded-2xl border-2 border-hairline-strong px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-surface-sunken"
        >
          Back to Play with Friends
        </button>
      </div>
    );
  }

  const isMember = players.some((p) => p.player_id === myPlayerId);
  if (!isMember) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-canvas px-4 text-center">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">Join room {roomCode}</h1>
          <p className="mt-1 text-sm text-ink-muted">Enter your name to join.</p>
        </div>
        <input
          value={joinName}
          onChange={(e) => setJoinName(e.target.value)}
          maxLength={20}
          placeholder="Your name"
          className="w-full max-w-xs rounded-xl border border-input-border bg-canvas px-3 py-2 text-center text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
        {error && <p className="text-sm text-error">{error}</p>}
        <button
          type="button"
          disabled={joining || !joinName.trim()}
          onClick={handleJoin}
          className="w-full max-w-xs rounded-2xl bg-accent px-4 py-3 font-bold text-white shadow-[0_5px_0_var(--accent-shadow)] transition-transform active:translate-y-[3px] active:shadow-[0_2px_0_var(--accent-shadow)] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none disabled:active:translate-y-0"
        >
          {joining ? 'Joining…' : 'Join'}
        </button>
      </div>
    );
  }

  const isHost = room.host_player_id === myPlayerId;

  if (room.status === 'lobby') {
    return <Lobby room={room} players={players} isHost={isHost} onStart={handleStart} />;
  }

  if (room.game_state) {
    return (
      <MultiplayerGameBoard
        state={room.game_state}
        code={roomCode}
        background={room.background}
        myPlayerId={myPlayerId}
        isHost={isHost}
        onUpdate={handleUpdate}
        onNextRound={handleNextRound}
        onPlayAgain={handlePlayAgain}
        onLeave={() => router.push('/')}
      />
    );
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-canvas text-sm text-ink-muted">
      Waiting for the game to start…
    </div>
  );
}
