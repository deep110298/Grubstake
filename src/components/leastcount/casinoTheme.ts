import type { CSSProperties } from 'react';

// Story Mode's map screens (world select + a world's level grid) are a fixed
// illustrated scene, like the playing cards — deliberately not theme-reactive.
// Warm white rather than dark, so it blends with the app's own white chrome
// (status bar, every other mode) instead of seaming against it.
const CARPET_TILE = `<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'>
  <path d='M32 4 L60 32 L32 60 L4 32 Z' fill='none' stroke='#c9a24a' stroke-width='1.1' opacity='0.28'/>
  <circle cx='32' cy='32' r='3.2' fill='#c9a24a' opacity='0.22'/>
</svg>`;

// A tiled carpet pattern that repeats to any content height — a CSS
// background layer instead of a full-height SVG, so it works for a short
// grid or a long scrolling list alike.
export const CASINO_BACKDROP_STYLE: CSSProperties = {
  backgroundColor: '#fdfbf8',
  backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(CARPET_TILE)}")`,
  backgroundRepeat: 'repeat',
  backgroundSize: '64px 64px',
};
