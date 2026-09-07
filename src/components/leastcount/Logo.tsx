import type { CSSProperties } from 'react';

const SIZES = {
  sm: { spade: 'text-2xl', word: 'text-[10px] tracking-[0.3em]', gap: 'gap-1' },
  md: { spade: 'text-4xl', word: 'text-xs tracking-[0.35em]', gap: 'gap-1.5' },
  lg: { spade: 'text-6xl', word: 'text-base tracking-[0.4em]', gap: 'gap-2' },
} as const;

export default function Logo({
  size = 'md',
  className = '',
  style,
}: {
  size?: keyof typeof SIZES;
  className?: string;
  style?: CSSProperties;
}) {
  const s = SIZES[size];

  return (
    <div className={`flex flex-col items-center ${s.gap} ${className}`} style={style} aria-label="Least Count">
      <span className="relative inline-block font-mono leading-none" aria-hidden="true">
        <span className={`${s.spade} text-ink`}>♠</span>
        <span className={`${s.spade} absolute inset-0 text-ink-muted`} style={{ clipPath: 'inset(0 0 0 50%)' }}>
          ♠
        </span>
      </span>
      <span className={`font-sans font-semibold uppercase text-ink ${s.word}`}>Least Count</span>
    </div>
  );
}
