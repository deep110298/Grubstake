'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { backgroundCss } from '@/lib/multiplayer/backgrounds';
import type { Room, RoomPlayerRow } from '@/lib/multiplayer/types';

const AVATAR_COLORS = ['bg-accent text-white', 'bg-wild text-white', 'bg-hairline text-ink'];

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
  const router = useRouter();
  const [copyState, setCopyState] = useState<'code' | 'link' | null>(null);
  const [starting, setStarting] = useState(false);

  async function handleCopyCode() {
    try {
      await navigator.clipboard.writeText(room.code);
      setCopyState('code');
      setTimeout(() => setCopyState(null), 1500);
    } catch {
      // clipboard access can fail silently (e.g. no permission) — not critical
    }
  }

  async function handleShareLink() {
    const url = `${window.location.origin}/room/${room.code}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Least Count', text: `Join my Least Count room: ${room.code}`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopyState('link');
      setTimeout(() => setCopyState(null), 1500);
    } catch {
      // sharing/clipboard can fail or be cancelled — not critical
    }
  }

  async function handleStart() {
    setStarting(true);
    onStart();
  }

  const canStart = players.length >= 2;
  const openSeats = room.max_players - players.length;

  return (
    <div
      className="flex min-h-dvh flex-col items-center px-6 pb-5 pt-1.5 text-ink"
      style={{ background: backgroundCss(room.background) }}
    >
      <button
        type="button"
        onClick={() => router.push('/')}
        className="mono-label w-full max-w-sm self-center text-xs text-ink-muted hover:text-ink"
      >
        ← Leave room
      </button>

      <div className="flex w-full max-w-sm flex-1 flex-col gap-3.5 pt-4.5">
        <div className="flex flex-col items-center gap-2 rounded-[22px] border border-hairline bg-surface-sunken p-4">
          <span className="mono-label text-[11px] text-ink-muted">Room code</span>
          <span className="font-mono text-4xl font-bold leading-none tracking-[0.14em] text-accent">{room.code}</span>
          <div className="flex w-full gap-2.5 pt-1.5">
            <button
              type="button"
              onClick={handleCopyCode}
              className="flex-1 rounded-[14px] border-2 border-hairline-strong py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-surface-sunken-alt"
            >
              {copyState === 'code' ? 'Copied!' : 'Copy code'}
            </button>
            <button
              type="button"
              onClick={handleShareLink}
              className="flex-1 rounded-[14px] border-2 border-hairline-strong py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-surface-sunken-alt"
            >
              {copyState === 'link' ? 'Copied!' : 'Share link'}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="mono-label flex items-center justify-between text-[11px] text-ink-muted">
            <span>Seated</span>
            <span>
              {players.length} / {room.max_players}
            </span>
          </div>
          {players.map((p, i) => (
            <div
              key={p.player_id}
              className="flex items-center gap-3 rounded-2xl border border-hairline bg-surface-sunken px-4 py-2.5"
            >
              <div
                className={`flex h-8.5 w-8.5 flex-none items-center justify-center rounded-[11px] font-display text-sm font-bold ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}
              >
                {p.name.slice(0, 1).toUpperCase()}
              </div>
              <div className="flex-1 text-[15px] font-semibold">{p.name}</div>
              {p.is_host && <span className="mono-label text-[10px] text-accent">Host</span>}
            </div>
          ))}
          {openSeats > 0 && (
            <div className="mono-label rounded-2xl border-2 border-dashed border-hairline py-2.5 text-center text-[11px] text-ink-faint">
              {openSeats} seat{openSeats === 1 ? '' : 's'} open
            </div>
          )}
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-hairline bg-surface-sunken px-4 py-3">
          <span className="mono-label text-[11px] text-ink-muted">Play to</span>
          <span className="rounded-[11px] border-2 border-accent bg-accent/10 px-3.5 py-1.5 font-display text-sm font-bold text-accent">
            {room.target_score}
          </span>
        </div>

        <div className="flex-1" />

        {isHost ? (
          <button
            type="button"
            disabled={!canStart || starting}
            onClick={handleStart}
            className="w-full rounded-2xl bg-accent px-4 py-[18px] text-center font-bold text-lg text-white shadow-[0_5px_0_var(--accent-shadow)] transition-transform active:translate-y-[3px] active:shadow-[0_2px_0_var(--accent-shadow)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:active:translate-y-0"
          >
            {starting ? 'Starting…' : canStart ? 'Deal first round' : 'Waiting for at least 2 players'}
          </button>
        ) : (
          <p className="text-center text-sm text-ink-muted">Waiting for the host to start the game…</p>
        )}
      </div>
    </div>
  );
}
