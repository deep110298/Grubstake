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

const CARD_SHADOW: Record<NonNullable<PlayingCardProps['size']>, string> = {
  sm: 'shadow-[0_3px_0_rgba(20,16,24,0.13)]',
  md: 'shadow-[0_4px_0_rgba(20,16,24,0.13)]',
  lg: 'shadow-[0_6px_0_rgba(20,16,24,0.13)]',
};

const SELECTED_SHADOW = 'shadow-[0_0_0_4px_rgba(10,111,120,0.25),0_8px_0_rgba(20,16,24,0.13)]';

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
  const isRaised = selected || isZeroValue;

  const borderClasses = selected
    ? `-translate-y-3.5 border-2 border-accent ${SELECTED_SHADOW}`
    : isZeroValue
      ? `border-2 border-wild ${CARD_SHADOW[size]}`
      : disabled
        ? `border border-card-back-border ${CARD_SHADOW[size]}`
        : `border border-hairline-card ${CARD_SHADOW[size]}`;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick || disabled}
      className={`relative flex flex-shrink-0 flex-col items-center justify-center rounded-lg font-mono font-bold transition-transform ${SIZE_CLASSES[size]} ${
        disabled && !isRaised ? 'bg-card-back-a' : isRaised ? 'bg-card-paper-warm' : 'bg-card-paper'
      } ${isRed ? 'text-card-red' : isPhysicalJoker ? 'text-wild' : 'text-card-ink'} ${borderClasses} ${
        onClick && !disabled ? 'cursor-pointer hover:-translate-y-1' : ''
      }`}
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
        <span className="absolute -top-2 -right-2 rounded-full bg-wild px-1 text-[9px] font-bold leading-tight text-white">
          0
        </span>
      )}
    </button>
  );
}

const BACK_BADGE_SIZE: Record<NonNullable<PlayingCardProps['size']>, string> = {
  sm: 'h-4 w-4 rounded-[5px]',
  md: 'h-5.5 w-5.5 rounded-[7px]',
  lg: 'h-6.5 w-6.5 rounded-[8px]',
};

const BACK_SPADE_SIZE: Record<NonNullable<PlayingCardProps['size']>, string> = {
  sm: 'text-[9px]',
  md: 'text-xs',
  lg: 'text-sm',
};

export function CardBack({ size = 'md' }: { size?: PlayingCardProps['size'] }) {
  return (
    <div
      className={`flex flex-shrink-0 flex-col items-center justify-center gap-1 rounded-lg border border-card-back-border bg-card-back-a ${CARD_SHADOW[size ?? 'md']} ${SIZE_CLASSES[size ?? 'md']}`}
    >
      <div
        className={`flex items-center justify-center bg-accent shadow-[0_1.5px_0_var(--accent-shadow)] ${BACK_BADGE_SIZE[size ?? 'md']}`}
      >
        <span className={`font-mono leading-none text-white ${BACK_SPADE_SIZE[size ?? 'md']}`}>♠</span>
      </div>
      {size !== 'sm' && (
        <span className="mono-label text-[6.5px] leading-none text-card-ink-soft">Least Count</span>
      )}
    </div>
  );
}
