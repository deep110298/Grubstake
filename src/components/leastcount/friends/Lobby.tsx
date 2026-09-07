'use client';

import { useState } from 'react';
import type { Room, RoomPlayerRow } from '@/lib/multiplayer/types';

export default function Lobby({
  room,
  players,
  isHost,
  onStart,
}: {
  room: Room;
  players: RoomPlayerRow[];
  isHost: boolean;
  onStart: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [starting, setStarting] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(room.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard access can fail silently (e.g. no permission) — not critical
    }
  }

  async function handleStart() {
    setStarting(true);
    onStart();
  }

  const canStart = players.length >= 2;

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-canvas px-4 py-10 text-center">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Waiting for players</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Target score {room.target_score} &middot; up to {room.max_players} players
        </p>
      </div>

      <button
        type="button"
        onClick={handleCopy}
        className="mono-label flex flex-col items-center gap-1 rounded-xl border border-hairline bg-surface px-8 py-4"
      >
        <span className="text-xs text-ink-faint">Room code</span>
        <span className="text-3xl tracking-[0.3em] text-ink">{room.code}</span>
        <span className="text-xs text-accent">{copied ? 'Copied!' : 'Tap to copy'}</span>
      </button>

      <div className="w-full max-w-xs rounded-xl border border-hairline bg-surface p-4 text-left">
        <div className="mono-label text-xs text-ink-faint">
          Players ({players.length}/{room.max_players})
        </div>
        <ul className="mt-2 space-y-1.5">
          {players.map((p) => (
            <li key={p.player_id} className="flex items-center justify-between text-sm text-ink">
              <span>{p.name}</span>
              {p.is_host && <span className="mono-label text-xs text-ink-faint">Host</span>}
            </li>
          ))}
        </ul>
      </div>

      {isHost ? (
        <button
          type="button"
          disabled={!canStart || starting}
          onClick={handleStart}
          className="w-full max-w-xs rounded-lg bg-accent px-4 py-3 font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {starting ? 'Starting…' : canStart ? 'Start game' : 'Waiting for at least 2 players'}
        </button>
      ) : (
        <p className="text-sm text-ink-muted">Waiting for the host to start the game…</p>
      )}
    </div>
  );
}
