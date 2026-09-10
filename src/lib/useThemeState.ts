'use client';

import { useEffect, useLayoutEffect, useState } from 'react';
import { THEME_STORAGE_KEY } from '@/lib/theme';

// Light unless the user has explicitly turned dark on — never inferred
// from the OS/browser preference.
function getCurrentTheme(): 'light' | 'dark' {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

// Shared by every theme-toggle button (the fixed global one and any inline
// ones) so they all read/write the same localStorage key and stay in sync.
export function useThemeState() {
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

  return { theme, toggle };
}
