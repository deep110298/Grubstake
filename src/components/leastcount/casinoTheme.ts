import type { CSSProperties } from 'react';

// Story Mode's map screens (world select + a world's level grid) are a fixed
// illustrated scene, like the playing cards — deliberately not theme-reactive.
export const CASINO_GOLD = '#f0cf70';
export const CASINO_GOLD_DIM = '#d4af37';

const CARPET_TILE = `<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'>
  <path d='M32 4 L60 32 L32 60 L4 32 Z' fill='none' stroke='${CASINO_GOLD_DIM}' stroke-width='1.3' opacity='0.4'/>
  <circle cx='32' cy='32' r='4' fill='${CASINO_GOLD_DIM}' opacity='0.3'/>
  <path d='M0 32 L32 0 M32 0 L64 32 M64 32 L32 64 M32 64 L0 32' stroke='${CASINO_GOLD_DIM}' stroke-width='0.6' opacity='0.16'/>
</svg>`;

// A tiled carpet pattern that repeats to any content height — a CSS
// background layer instead of a full-height SVG, so it works for a short
// grid or a long scrolling list alike.
export const CASINO_BACKDROP_STYLE: CSSProperties = {
  backgroundColor: '#160709',
  backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(CARPET_TILE)}")`,
  backgroundRepeat: 'repeat',
  backgroundSize: '64px 64px',
};
