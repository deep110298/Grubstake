export type RoomBackground = 'default' | 'trellis' | 'clover' | 'parchment' | 'confetti';

interface BackgroundOption {
  value: RoomBackground;
  label: string;
  css: string;
}

function encodeSvg(svg: string): string {
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

// A single muted suit glyph, tiled in a plain grid — reads as quiet linen
// texture rather than a loud playing-card print.
function suitGrid(glyph: string, color: string, opacity: number, size: number, fontSize: number): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'><text x='50%' y='58%' text-anchor='middle' font-family='Georgia,serif' font-size='${fontSize}' fill='${color}' fill-opacity='${opacity}'>${glyph}</text></svg>`;
  return encodeSvg(svg);
}

// Thin diamond outlines meeting edge-to-edge tile-to-tile, forming a
// continuous argyle-style lattice rather than a scattered pattern.
function diamondTrellis(color: string, opacity: number, size: number, strokeWidth: number): string {
  const half = size / 2;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'><path d='M0 ${half} L${half} 0 L${size} ${half} L${half} ${size} Z' fill='none' stroke='${color}' stroke-opacity='${opacity}' stroke-width='${strokeWidth}'/></svg>`;
  return encodeSvg(svg);
}

// Four suit glyphs, each a different soft color, scattered across a larger
// tile so it reads as a gentle mix rather than a single repeated icon.
function suitConfetti(color: string, opacity: number): string {
  const suits = [
    { glyph: '♠', x: 18, y: 26 },
    { glyph: '♥', x: 54, y: 18 },
    { glyph: '♦', x: 26, y: 58 },
    { glyph: '♣', x: 58, y: 56 },
  ];
  const texts = suits
    .map(
      (s) =>
        `<text x='${s.x}' y='${s.y}' text-anchor='middle' font-family='Georgia,serif' font-size='15' fill='${color}' fill-opacity='${opacity}'>${s.glyph}</text>`
    )
    .join('');
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='76' height='76'>${texts}</svg>`;
  return encodeSvg(svg);
}

export const ROOM_BACKGROUNDS: BackgroundOption[] = [
  {
    value: 'default',
    label: 'Quiet Spades',
    css: `#faf8f4 ${suitGrid('♠', '#8a8378', 0.16, 40, 15)} repeat`,
  },
  {
    value: 'trellis',
    label: 'Diamond Trellis',
    css: `#fdf6f3 ${diamondTrellis('#c98a93', 0.32, 48, 1)} repeat`,
  },
  {
    value: 'clover',
    label: 'Soft Clover',
    css: `#f6f8f4 ${suitGrid('♣', '#7c9473', 0.18, 40, 15)} repeat`,
  },
  {
    value: 'parchment',
    label: 'Vintage Parchment',
    css: `#fbf3e3 ${diamondTrellis('#b08a4e', 0.4, 44, 1)} repeat`,
  },
  {
    value: 'confetti',
    label: 'Suit Confetti',
    css: `#faf9f6 ${suitConfetti('#8a7f74', 0.16)} repeat`,
  },
];

const BY_VALUE = new Map(ROOM_BACKGROUNDS.map((b) => [b.value, b]));

export function backgroundCss(value: string | null | undefined): string {
  return BY_VALUE.get(value as RoomBackground)?.css ?? ROOM_BACKGROUNDS[0].css;
}
