'use client';

import { useThemeState } from '@/lib/useThemeState';

// Same toggle as the global fixed one, but sized to sit in a screen's own
// header flow instead of floating over the corner — used where the corner
// spot is already spoken for (the game boards' Pause/Round/Rules row).
export default function InlineThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggle } = useThemeState();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`flex h-6 w-6 items-center justify-center rounded-full border border-hairline bg-surface text-xs shadow-[0_2px_6px_rgba(0,0,0,0.1)] transition-transform active:scale-90 ${className}`}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
