'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useSyncExternalStore } from 'react';
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
      <Link href="/" className="mono-label absolute left-4 top-4 text-xs text-ink-faint hover:text-ink">
        ← Back
      </Link>

      {view === 'choice' && (
        <>
          <div>
            <h1 className="text-3xl font-semibold text-ink">Play with Friends</h1>
            <p className="mt-2 max-w-xs text-sm text-ink-muted">
              Create a room and share the code, or join a friend&apos;s room.
            </p>
          </div>
          <div className="flex w-full max-w-xs flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                setError(null);
                setView('create');
              }}
              className="w-full rounded-lg bg-accent px-4 py-3 font-medium text-white transition-opacity hover:opacity-90"
            >
              Create a room
            </button>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setView('join');
              }}
              className="w-full rounded-lg border border-hairline px-4 py-2.5 font-medium text-ink transition-colors hover:bg-surface-sunken"
            >
              Join a room
            </button>
          </div>
        </>
      )}

      {view === 'create' && (
        <>
          <div>
            <h1 className="text-2xl font-semibold text-ink">Create a room</h1>
            <p className="mt-2 max-w-xs text-sm text-ink-muted">Set it up, then share the code with your friends.</p>
          </div>

          <div className="w-full max-w-xs space-y-4 rounded-xl border border-hairline bg-surface p-4 text-left">
            <div>
              <label className="mono-label text-xs text-ink-faint">Your name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={20}
                placeholder="Enter your name"
                className="mt-1 w-full rounded-lg border border-input-border bg-canvas px-3 py-2 text-sm text-ink outline-none focus:border-accent"
              />
            </div>

            <div>
              <div className="mono-label text-xs text-ink-faint">Players</div>
              <div className="mt-1 grid grid-cols-5 gap-2">
                {PLAYER_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setMaxPlayers(option)}
                    className={`rounded-lg border px-2 py-2 text-sm font-medium transition-colors ${
                      maxPlayers === option
                        ? 'border-accent bg-accent-tint text-accent'
                        : 'border-hairline text-ink-muted hover:bg-surface-sunken'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mono-label text-xs text-ink-faint">Play to</div>
              <div className="mt-1 flex gap-2">
                {TARGET_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setTargetScore(option)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      targetScore === option
                        ? 'border-accent bg-accent-tint text-accent'
                        : 'border-hairline text-ink-muted hover:bg-surface-sunken'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-error">{error}</p>}

          <div className="flex w-full max-w-xs flex-col gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={handleCreate}
              className="w-full rounded-lg bg-accent px-4 py-3 font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? 'Creating…' : 'Create room'}
            </button>
            <button
              type="button"
              onClick={() => setView('choice')}
              className="w-full rounded-lg border border-hairline px-4 py-2.5 font-medium text-ink transition-colors hover:bg-surface-sunken"
            >
              Back
            </button>
          </div>
        </>
      )}

      {view === 'join' && (
        <>
          <div>
            <h1 className="text-2xl font-semibold text-ink">Join a room</h1>
            <p className="mt-2 max-w-xs text-sm text-ink-muted">Enter the code your friend shared with you.</p>
          </div>

          <div className="w-full max-w-xs space-y-4 rounded-xl border border-hairline bg-surface p-4 text-left">
            <div>
              <label className="mono-label text-xs text-ink-faint">Your name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={20}
                placeholder="Enter your name"
                className="mt-1 w-full rounded-lg border border-input-border bg-canvas px-3 py-2 text-sm text-ink outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="mono-label text-xs text-ink-faint">Room code</label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={6}
                placeholder="e.g. K3F9QZ"
                className="mono-label mt-1 w-full rounded-lg border border-input-border bg-canvas px-3 py-2 text-center text-lg tracking-widest text-ink outline-none focus:border-accent"
              />
            </div>
          </div>

          {error && <p className="text-sm text-error">{error}</p>}

          <div className="flex w-full max-w-xs flex-col gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={handleJoin}
              className="w-full rounded-lg bg-accent px-4 py-3 font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? 'Joining…' : 'Join room'}
            </button>
            <button
              type="button"
              onClick={() => setView('choice')}
              className="w-full rounded-lg border border-hairline px-4 py-2.5 font-medium text-ink transition-colors hover:bg-surface-sunken"
            >
              Back
            </button>
          </div>
        </>
      )}
    </div>
  );
}
