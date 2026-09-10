'use client';

import { useSyncExternalStore } from 'react';

// Lets a screen that renders its own inline theme toggle (positioned to fit
// its own layout) tell the global fixed corner toggle to step aside, instead
// of showing two toggle buttons at once. A plain external store rather than
// context — this is a single flag with exactly two writers (a game board
// mounting/unmounting), not something that needs a provider tree.
let hidden = false;
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

export function hideGlobalThemeToggle() {
  hidden = true;
  emitChange();
}

export function showGlobalThemeToggle() {
  hidden = false;
  emitChange();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return hidden;
}

function getServerSnapshot() {
  return false;
}

export function useGlobalThemeToggleHidden() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
