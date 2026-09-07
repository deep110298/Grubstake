import type { PlayingCard as PlayingCardData, Rank } from '@/lib/leastCount/types';

const SUIT_SYMBOL: Record<PlayingCardData['suit'], string> = {
  spades: '♠',
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
};

const RED_SUITS = new Set(['hearts', 'diamonds']);

interface PlayingCardProps {
  card: PlayingCardData;
  jokerRank?: Rank;
  selected?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const SIZE_CLASSES: Record<NonNullable<PlayingCardProps['size']>, string> = {
  sm: 'w-10 h-14 text-sm',
  md: 'w-14 h-20 text-lg',
  lg: 'w-16 h-24 text-xl',
};

export default function PlayingCard({
  card,
  jokerRank,
  selected,
  disabled,
  size = 'md',
  onClick,
}: PlayingCardProps) {
  const isPhysicalJoker = card.rank === 'JOKER';
  const isRed = !isPhysicalJoker && RED_SUITS.has(card.suit);
  const isWildRank = card.rank === jokerRank;
  const isZeroValue = isPhysicalJoker || isWildRank;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick || disabled}
      className={`relative flex flex-shrink-0 flex-col items-center justify-center rounded-lg border bg-surface font-mono font-semibold shadow-sm transition-transform ${SIZE_CLASSES[size]} ${
        isRed ? 'text-error' : isPhysicalJoker ? 'text-accent' : 'text-ink'
      } ${selected ? '-translate-y-2 border-accent ring-2 ring-accent' : 'border-hairline-card'} ${
        onClick && !disabled ? 'cursor-pointer hover:-translate-y-1' : ''
      } ${disabled ? 'opacity-50' : ''}`}
      aria-pressed={selected}
      aria-label={isPhysicalJoker ? 'Joker' : `${card.rank} of ${card.suit}`}
    >
      {isPhysicalJoker ? (
        <span className="text-xs leading-tight">JOKER</span>
      ) : (
        <>
          <span className="leading-none">{card.rank}</span>
          <span className="leading-none">{SUIT_SYMBOL[card.suit]}</span>
        </>
      )}
      {isZeroValue && (
        <span className="absolute -top-2 -right-2 rounded-full bg-accent px-1 text-[9px] font-bold leading-tight text-white">
          0
        </span>
      )}
    </button>
  );
}

export function CardBack({ size = 'md' }: { size?: PlayingCardProps['size'] }) {
  return (
    <div
      className={`flex flex-shrink-0 items-center justify-center rounded-lg border border-hairline-card ${SIZE_CLASSES[size ?? 'md']}`}
      style={{ background: 'repeating-linear-gradient(135deg, #2f6b4f 0 6px, #245740 6px 12px)' }}
    />
  );
}
