import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'leastcount_player_id';

function noopSubscribe() {
  return () => {};
}

function getServerSnapshot(): string {
  return '';
}

// Identifies this browser across a reload so a dropped connection can
// rejoin the same seat. Not an auth system — just a stable local id.
export function getPlayerId(): string {
  if (typeof window === 'undefined') return '';
  let id = window.localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}

// SSR-safe hook: renders '' on the server and during the first client
// render (matching, so no hydration mismatch), then swaps in the real,
// localStorage-backed id right after.
export function usePlayerId(): string {
  return useSyncExternalStore(noopSubscribe, getPlayerId, getServerSnapshot);
}
