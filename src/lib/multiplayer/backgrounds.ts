export type RoomBackground = 'default' | 'teal' | 'wild' | 'sunset' | 'lavender' | 'golden';

interface BackgroundOption {
  value: RoomBackground;
  label: string;
  css: string;
}

export const ROOM_BACKGROUNDS: BackgroundOption[] = [
  { value: 'default', label: 'Classic', css: 'var(--canvas)' },
  { value: 'teal', label: 'Teal Mist', css: 'linear-gradient(160deg, #e3f2f1 0%, #ffffff 55%)' },
  { value: 'wild', label: 'Wild Bloom', css: 'linear-gradient(160deg, #fbe6f0 0%, #ffffff 55%)' },
  { value: 'sunset', label: 'Sunset Glow', css: 'linear-gradient(160deg, #fdeae0 0%, #fffaf2 55%)' },
  { value: 'lavender', label: 'Lavender Sky', css: 'linear-gradient(160deg, #ece7f7 0%, #ffffff 55%)' },
  { value: 'golden', label: 'Golden Hour', css: 'linear-gradient(160deg, #fdf3d9 0%, #ffffff 55%)' },
];

const BY_VALUE = new Map(ROOM_BACKGROUNDS.map((b) => [b.value, b]));

export function backgroundCss(value: string | null | undefined): string {
  return BY_VALUE.get(value as RoomBackground)?.css ?? ROOM_BACKGROUNDS[0].css;
}
