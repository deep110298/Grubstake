'use client';

import { useThemeState } from '@/lib/useThemeState';
import { useGlobalThemeToggleHidden } from '@/lib/themeToggleVisibility';

export default function ThemeToggle() {
  const { theme, toggle } = useThemeState();
  const hidden = useGlobalThemeToggleHidden();

  if (hidden) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="fixed right-2.5 top-[max(0.625rem,env(safe-area-inset-top))] z-[60] flex h-8 w-8 items-center justify-center rounded-full border border-hairline bg-surface text-sm shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition-transform active:scale-90"
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
