'use client';

import { useSyncExternalStore } from 'react';

const NAME_STORAGE_KEY = 'leastcount_player_name';

export function getSavedPlayerName(): string {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(NAME_STORAGE_KEY) ?? '';
}

export function savePlayerName(name: string) {
  window.localStorage.setItem(NAME_STORAGE_KEY, name);
}

function noopSubscribe() {
  return () => {};
}

function getServerSnapshot() {
  return '';
}

// SSR-safe: '' on the server and the first client render (matching, so no
// hydration mismatch), then the saved name right after.
export function useSavedPlayerName(): string {
  return useSyncExternalStore(noopSubscribe, getSavedPlayerName, getServerSnapshot);
}
