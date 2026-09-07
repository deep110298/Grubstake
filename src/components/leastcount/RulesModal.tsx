import Modal from './Modal';
import { INCORRECT_CALL_PENALTY } from '@/lib/leastCount/engine';

export default function RulesModal({
  onClose,
  variant = 'computer',
}: {
  onClose: () => void;
  variant?: 'computer' | 'friends';
}) {
  const opponent = variant === 'computer' ? 'the computer' : 'your friends';

  return (
    <Modal>
      <h2 className="text-lg font-semibold text-ink">How to play</h2>
      <div className="mt-3 space-y-3 text-sm text-ink-muted">
        <p>Everyone&apos;s dealt 5 cards. Lower is better — the goal is to keep your hand&apos;s total value low.</p>
        <p><strong className="text-ink">Card values:</strong> number cards count as their face value. Aces and face cards (J, Q, K) count as 10.</p>
        <p><strong className="text-ink">Joker:</strong> each round one card is set aside at random and its rank becomes that round&apos;s joker. Any card of that rank is worth 0, for everyone.</p>
        <p><strong className="text-ink">Your turn:</strong> choose a card from your hand and play it onto the discard pile. If its rank matches the pile&apos;s current top card, that&apos;s it — your turn ends and your hand is one card smaller. If it doesn&apos;t match, you then draw a replacement: either blind from the deck, or by taking the specific card that was on top of the pile before you played.</p>
        <p><strong className="text-ink">Playing a set:</strong> if you hold two or more cards of the same rank, you can play them together the same way. If they don&apos;t match the pile, you still only draw a single replacement card no matter how many you played.</p>
        {variant === 'computer' ? (
          <p><strong className="text-ink">Calling:</strong> if you think your hand total is the lowest, call instead of playing a card. If you&apos;re right, your opponent scores their hand&apos;s value and you score nothing. If you&apos;re wrong, only you are penalized {INCORRECT_CALL_PENALTY} points — your opponent&apos;s score doesn&apos;t change either way. An exact tie is scored as a win for the computer.</p>
        ) : (
          <p><strong className="text-ink">Calling:</strong> if you think your hand total is the lowest, call instead of playing a card. If you&apos;re right (ties count in your favor), everyone else scores their hand&apos;s value and you score nothing. If you&apos;re wrong, only you are penalized {INCORRECT_CALL_PENALTY} points — nobody else&apos;s score changes that round.</p>
        )}
        <p><strong className="text-ink">Winning:</strong> the first player to reach the target score loses — whoever&apos;s left with the lowest score wins.</p>
      </div>
      <p className="mt-1 text-xs text-ink-faint">Playing against {opponent}.</p>
      <button
        type="button"
        onClick={onClose}
        className="mt-3 w-full rounded-lg bg-accent px-4 py-2.5 font-medium text-white transition-opacity hover:opacity-90"
      >
        Got it
      </button>
    </Modal>
  );
}
