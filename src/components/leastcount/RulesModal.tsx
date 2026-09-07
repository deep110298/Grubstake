import Modal from './Modal';
import { DECLARE_THRESHOLD as COMPUTER_DECLARE_THRESHOLD, INCORRECT_CALL_PENALTY } from '@/lib/leastCount/engine';
import { DECLARE_THRESHOLD as FRIENDS_DECLARE_THRESHOLD } from '@/lib/multiplayer/engine';

export default function RulesModal({
  onClose,
  variant = 'computer',
}: {
  onClose: () => void;
  variant?: 'computer' | 'friends';
}) {
  const isComputer = variant === 'computer';
  const declareThreshold = isComputer ? COMPUTER_DECLARE_THRESHOLD : FRIENDS_DECLARE_THRESHOLD;

  return (
    <Modal>
      <h2 className="font-display text-lg font-semibold text-ink">How to play</h2>
      <div className="mt-3 space-y-3 text-sm text-ink-muted">
        {isComputer ? (
          <p><strong className="text-ink">Card values:</strong> number cards count as their face value. Aces count as 1. Face cards (J, Q, K) count as 10.</p>
        ) : (
          <p><strong className="text-ink">Card values:</strong> number cards count as their face value. Aces count as 1. Face cards (J, Q, K) count as 10. A Joker card is always worth 0.</p>
        )}
        {isComputer ? (
          <p><strong className="text-ink">Wild card:</strong> each round one card is set aside at random and its rank becomes that round&apos;s wild card. Any card of that rank is worth 0, for everyone.</p>
        ) : (
          <>
            <p><strong className="text-ink">Deck:</strong> a 2-player room plays with one deck (52 cards + 1 Joker); 3 or more players play with two decks shuffled together (104 cards + 2 Jokers).</p>
            <p><strong className="text-ink">Wild card rank:</strong> each round one card is set aside at random and its rank becomes that round&apos;s wild card — any card of that rank is worth 0, on top of the Joker card(s) always being worth 0. If the card set aside is itself a Joker, the wild card defaults to Ace.</p>
          </>
        )}
        <p><strong className="text-ink">Your turn:</strong> choose a card from your hand and play it onto the discard pile. If its rank matches the pile&apos;s current top card, that&apos;s it — your turn ends and your hand is one card smaller. If it doesn&apos;t match, you then draw a replacement: either blind from the deck, or by taking the specific card that was on top of the pile before you played.</p>
        <p><strong className="text-ink">Playing a set:</strong> if you hold two or more cards of the same rank, you can play them together the same way. If they don&apos;t match the pile, you still only draw a single replacement card no matter how many you played.</p>
        <p><strong className="text-ink">Calling:</strong> you can only call once your hand totals {declareThreshold} or less, and you must call instead of playing a card that turn.</p>
        {isComputer ? (
          <p>If you&apos;re right, your opponent scores their hand&apos;s value and you score nothing. If you&apos;re wrong, only you are penalized {INCORRECT_CALL_PENALTY} points — your opponent&apos;s score doesn&apos;t change either way. An exact tie is scored as a win for the computer.</p>
        ) : (
          <>
            <p>To be right, your hand has to be strictly the lowest — an exact tie with anyone else counts as a wrong call. If you&apos;re right, everyone else scores their hand&apos;s value and you score nothing. If you&apos;re wrong, only you are penalized {INCORRECT_CALL_PENALTY} points — nobody else&apos;s score changes that round.</p>
            <p><strong className="text-ink">Winning:</strong> once a player&apos;s total reaches the target score, they&apos;re eliminated and the rest keep playing. The last player left standing wins.</p>
          </>
        )}
        {isComputer && (
          <p><strong className="text-ink">Winning:</strong> the first player to reach the target score loses — the other player wins.</p>
        )}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="mt-3 w-full rounded-2xl bg-accent px-4 py-3 font-bold text-white shadow-[0_4px_0_var(--accent-shadow)] transition-transform active:translate-y-[2px] active:shadow-[0_2px_0_var(--accent-shadow)]"
      >
        Got it
      </button>
    </Modal>
  );
}
