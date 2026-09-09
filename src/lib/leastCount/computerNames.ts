const COMPUTER_NAMES = [
  'Ace',
  'Joker',
  'Maverick',
  'Nova',
  'Blitz',
  'Rook',
  'Duchess',
  'Baron',
  'Trickster',
  'Vega',
  'Cipher',
  'Domino',
  'Wildcard',
  'Shuffle',
  'Jinx',
  'Zephyr',
  'Ranger',
  'Quill',
  'Sly',
  'Bandit',
];

// Picks a random opponent name, avoiding a collision with the player's own
// name so the two score blocks never read the same.
export function randomComputerName(exclude?: string): string {
  const excludeLower = exclude?.trim().toLowerCase();
  const candidates = excludeLower
    ? COMPUTER_NAMES.filter((name) => name.toLowerCase() !== excludeLower)
    : COMPUTER_NAMES;
  return candidates[Math.floor(Math.random() * candidates.length)];
}
