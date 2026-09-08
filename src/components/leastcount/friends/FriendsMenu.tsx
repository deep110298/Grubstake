'use client';

import type { CSSProperties } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useSyncExternalStore } from 'react';
import PlayingCard from '@/components/leastcount/PlayingCard';
import { ROOM_BACKGROUNDS, type RoomBackground } from '@/lib/multiplayer/backgrounds';
import { createRoom, joinRoom, RoomServiceError } from '@/lib/multiplayer/roomService';
import { getPlayerId } from '@/lib/multiplayer/playerId';

const PLAYER_OPTIONS = [2, 3, 4, 5, 6];
const TARGET_OPTIONS = [50, 100, 150];
const NAME_STORAGE_KEY = 'leastcount_player_name';

function getSavedName(): string {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(NAME_STORAGE_KEY) ?? '';
}

function noopSubscribe() {
  return () => {};
}

function getServerSnapshot() {
  return '';
}

// SSR-safe: '' on the server and the first client render (matching, so no
// hydration mismatch), then the saved name right after.
function useSavedName(): string {
  return useSyncExternalStore(noopSubscribe, getSavedName, getServerSnapshot);
}

function saveName(name: string) {
  window.localStorage.setItem(NAME_STORAGE_KEY, name);
}

type View = 'choice' | 'create' | 'join';

export default function FriendsMenu() {
  const router = useRouter();
  const [view, setView] = useState<View>('choice');
  // The saved name is '' on the server and the first client render (no
  // hydration mismatch); nameOverride takes over once the user edits it, or
  // once the real saved value arrives, whichever the input last reflects.
  const savedName = useSavedName();
  const [nameOverride, setNameOverride] = useState<string | null>(null);
  const name = nameOverride ?? savedName;
  const setName = setNameOverride;
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [targetScore, setTargetScore] = useState(100);
  const [background, setBackground] = useState<RoomBackground>('default');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleCreate() {
    if (!name.trim()) {
      setError('Enter your name first.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      saveName(name.trim());
      const playerId = getPlayerId();
      const roomCode = await createRoom({
        hostPlayerId: playerId,
        hostName: name.trim(),
        maxPlayers,
        targetScore,
        background,
      });
      router.push(`/room/${roomCode}`);
    } catch (err) {
      setError(err instanceof RoomServiceError ? err.message : 'Could not create the room. Try again.');
      setBusy(false);
    }
  }

  async function handleJoin() {
    if (!name.trim()) {
      setError('Enter your name first.');
      return;
    }
    if (code.trim().length < 4) {
      setError('Enter the room code your friend shared.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      saveName(name.trim());
      const playerId = getPlayerId();
      const roomCode = code.trim().toUpperCase();
      await joinRoom({ code: roomCode, playerId, name: name.trim() });
      router.push(`/room/${roomCode}`);
    } catch (err) {
      setError(err instanceof RoomServiceError ? err.message : 'Could not join that room. Try again.');
      setBusy(false);
    }
  }

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center gap-6 bg-canvas px-4 py-10 text-center">
      <Link href="/" className="mono-label absolute left-4 top-4 text-xs text-ink-muted hover:text-ink">
        ← Back
      </Link>

      {view === 'choice' && (
        <>
          <div className="flex justify-center -space-x-5">
            <div className="hero-card" style={{ '--card-tilt': '-10deg', '--card-lift': '4px' } as CSSProperties}>
              <div className="hero-card-inner" style={{ '--float-delay': '0s' } as CSSProperties}>
                <PlayingCard card={{ id: 'friends-hero-1', suit: 'hearts', rank: 'K' }} size="md" />
              </div>
            </div>
            <div className="hero-card z-10" style={{ '--card-tilt': '10deg', '--card-lift': '-4px' } as CSSProperties}>
              <div className="hero-card-inner" style={{ '--float-delay': '0.3s' } as CSSProperties}>
                <PlayingCard card={{ id: 'friends-hero-2', suit: 'clubs', rank: '7' }} size="md" />
              </div>
            </div>
          </div>

          <div>
            <h1
              className="fade-up font-display text-[32px] font-extrabold leading-tight tracking-tight text-ink"
              style={{ animationDelay: '80ms' }}
            >
              Play with Friends
            </h1>
            <p className="fade-up mt-2 max-w-xs text-[15px] leading-relaxed text-ink-muted" style={{ animationDelay: '160ms' }}>
              Create a room or join one — lowest hand each round wins.
            </p>
          </div>
          <div className="fade-up flex w-full max-w-xs flex-col gap-3" style={{ animationDelay: '240ms' }}>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setView('create');
              }}
              className="rounded-[18px] bg-accent px-4 py-[18px] text-center font-bold text-lg text-white shadow-[0_5px_0_var(--accent-shadow)] transition-transform active:translate-y-[3px] active:shadow-[0_2px_0_var(--accent-shadow)]"
            >
              Create a room
            </button>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setView('join');
              }}
              className="rounded-[18px] border-2 border-hairline-strong px-4 py-4 text-center font-semibold text-lg text-ink transition-colors hover:bg-surface-sunken"
            >
              Join a room
            </button>
          </div>
        </>
      )}

      {view === 'create' && (
        <>
          <div>
            <h1 className="fade-up font-display text-[26px] font-extrabold leading-tight tracking-tight text-ink">
              Create a room
            </h1>
            <p className="fade-up mt-2 max-w-xs text-[15px] leading-relaxed text-ink-muted" style={{ animationDelay: '80ms' }}>
              Set it up, then share the code with your friends.
            </p>
          </div>

          <div
            className="fade-up w-full max-w-xs space-y-4 rounded-[22px] border border-hairline bg-surface-sunken p-5 text-left"
            style={{ animationDelay: '160ms' }}
          >
            <div>
              <label className="mono-label text-[11px] text-ink-muted">Your name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={20}
                placeholder="Enter your name"
                className="mt-1 w-full rounded-xl border border-input-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </div>

            <div>
              <div className="mono-label text-[11px] text-ink-muted">Players</div>
              <div className="mt-1.5 grid grid-cols-5 gap-2">
                {PLAYER_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setMaxPlayers(option)}
                    className={`rounded-[12px] border-2 py-2.5 text-sm font-display font-semibold transition-all active:scale-95 ${
                      maxPlayers === option
                        ? 'border-accent bg-accent/10 font-bold text-accent'
                        : 'border-hairline text-ink-muted hover:bg-surface-sunken-alt'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mono-label text-[11px] text-ink-muted">Play to</div>
              <div className="mt-1.5 flex gap-2">
                {TARGET_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setTargetScore(option)}
                    className={`flex-1 rounded-[12px] border-2 py-2.5 text-sm font-display font-semibold transition-all active:scale-95 ${
                      targetScore === option
                        ? 'border-accent bg-accent/10 font-bold text-accent'
                        : 'border-hairline text-ink-muted hover:bg-surface-sunken-alt'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mono-label text-[11px] text-ink-muted">Background</div>
              <div className="mt-1.5 flex gap-2.5">
                {ROOM_BACKGROUNDS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setBackground(option.value)}
                    aria-label={option.label}
                    aria-pressed={background === option.value}
                    className={`h-9 w-9 flex-1 rounded-full border-2 transition-all active:scale-95 ${
                      background === option.value ? 'border-accent shadow-[0_0_0_3px_rgba(10,111,120,0.15)]' : 'border-hairline-strong'
                    }`}
                    style={{ background: option.css }}
                  />
                ))}
              </div>
            </div>
          </div>

          {error && <p className="rounded-xl bg-error/10 px-3 py-2 text-sm text-error">{error}</p>}

          <div className="fade-up flex w-full max-w-xs flex-col gap-3" style={{ animationDelay: '240ms' }}>
            <button
              type="button"
              disabled={busy}
              onClick={handleCreate}
              className="rounded-[18px] bg-accent px-4 py-[18px] text-center font-bold text-lg text-white shadow-[0_5px_0_var(--accent-shadow)] transition-transform active:translate-y-[3px] active:shadow-[0_2px_0_var(--accent-shadow)] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none disabled:active:translate-y-0"
            >
              {busy ? 'Creating…' : 'Create room'}
            </button>
            <button
              type="button"
              onClick={() => setView('choice')}
              className="rounded-[18px] border-2 border-hairline-strong px-4 py-4 text-center font-semibold text-lg text-ink transition-colors hover:bg-surface-sunken"
            >
              Back
            </button>
          </div>
        </>
      )}

      {view === 'join' && (
        <>
          <div>
            <h1 className="fade-up font-display text-[26px] font-extrabold leading-tight tracking-tight text-ink">
              Join a room
            </h1>
            <p className="fade-up mt-2 max-w-xs text-[15px] leading-relaxed text-ink-muted" style={{ animationDelay: '80ms' }}>
              Enter the code your friend shared with you.
            </p>
          </div>

          <div
            className="fade-up w-full max-w-xs space-y-4 rounded-[22px] border border-hairline bg-surface-sunken p-5 text-left"
            style={{ animationDelay: '160ms' }}
          >
            <div>
              <label className="mono-label text-[11px] text-ink-muted">Your name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={20}
                placeholder="Enter your name"
                className="mt-1 w-full rounded-xl border border-input-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </div>
            <div>
              <label className="mono-label text-[11px] text-ink-muted">Room code</label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={6}
                placeholder="e.g. K3F9QZ"
                className="mono-label mt-1 w-full rounded-xl border border-input-border bg-surface px-3 py-2 text-center text-lg tracking-widest text-ink outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </div>
          </div>

          {error && <p className="rounded-xl bg-error/10 px-3 py-2 text-sm text-error">{error}</p>}

          <div className="fade-up flex w-full max-w-xs flex-col gap-3" style={{ animationDelay: '240ms' }}>
            <button
              type="button"
              disabled={busy}
              onClick={handleJoin}
              className="rounded-[18px] bg-accent px-4 py-[18px] text-center font-bold text-lg text-white shadow-[0_5px_0_var(--accent-shadow)] transition-transform active:translate-y-[3px] active:shadow-[0_2px_0_var(--accent-shadow)] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none disabled:active:translate-y-0"
            >
              {busy ? 'Joining…' : 'Join room'}
            </button>
            <button
              type="button"
              onClick={() => setView('choice')}
              className="rounded-[18px] border-2 border-hairline-strong px-4 py-4 text-center font-semibold text-lg text-ink transition-colors hover:bg-surface-sunken"
            >
              Back
            </button>
          </div>
        </>
      )}
    </div>
  );
}
