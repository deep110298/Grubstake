'use client';

import { useEffect, useLayoutEffect, useState } from 'react';

export const THEME_STORAGE_KEY = 'leastcount_theme';

// Light unless the user has explicitly turned dark on — never inferred
// from the OS/browser preference.
function getCurrentTheme(): 'light' | 'dark' {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

export default function ThemeToggle() {
  // Server-rendered as light (matching the default assumption); corrected
  // right after mount once we can read localStorage/matchMedia, same as the
  // saved-name pattern used elsewhere in this app.
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // React's dev-mode Strict Mode remount resets <html> to only the
  // attributes it manages from JSX, clearing the data-theme the inline
  // script set (since it isn't rendered from JSX at all). Re-apply it here
  // as a synchronous, before-paint safety net — a no-op in production.
  useLayoutEffect(() => {
    try {
      const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'dark' || stored === 'light') {
        document.documentElement.setAttribute('data-theme', stored);
      }
    } catch {
      // localStorage can be unavailable (private mode, disabled) — fine to skip
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setTheme(getCurrentTheme()), 0);
    return () => clearTimeout(timer);
  }, []);

  function toggle() {
    const next = getCurrentTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    window.localStorage.setItem(THEME_STORAGE_KEY, next);
    setTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="fixed right-2.5 top-2.5 z-[60] flex h-8 w-8 items-center justify-center rounded-full border border-hairline bg-surface text-sm shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition-transform active:scale-90"
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
