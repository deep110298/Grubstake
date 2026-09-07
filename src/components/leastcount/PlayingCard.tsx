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
      : `border border-hairline-card ${CARD_SHADOW[size]}`;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick || disabled}
      className={`relative flex flex-shrink-0 flex-col items-center justify-center rounded-lg font-mono font-bold transition-transform ${SIZE_CLASSES[size]} ${
        isRaised ? 'bg-surface-warm' : 'bg-surface'
      } ${isRed ? 'text-suit-red' : isPhysicalJoker ? 'text-wild' : 'text-ink'} ${borderClasses} ${
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
        <span className="absolute -top-2 -right-2 rounded-full bg-wild px-1 text-[9px] font-bold leading-tight text-white">
          0
        </span>
      )}
    </button>
  );
}

const BACK_SPADE_SIZE: Record<NonNullable<PlayingCardProps['size']>, string> = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-3xl',
};

export function CardBack({ size = 'md' }: { size?: PlayingCardProps['size'] }) {
  return (
    <div
      className={`flex flex-shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg border border-card-back-border ${CARD_SHADOW[size ?? 'md']} ${SIZE_CLASSES[size ?? 'md']}`}
      style={{ background: 'repeating-linear-gradient(135deg, var(--card-back-a) 0 7px, var(--card-back-b) 7px 14px)' }}
    >
      <span className={`font-mono leading-none text-ink/20 ${BACK_SPADE_SIZE[size ?? 'md']}`}>♠</span>
      {size !== 'sm' && (
        <span className="mono-label text-[6px] leading-none text-ink/15">Least Count</span>
      )}
    </div>
  );
}
