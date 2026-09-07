import Modal from './Modal';
import { INCORRECT_CALL_PENALTY } from '@/lib/leastCount/engine';

export default function RulesModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal>
      <h2 className="text-lg font-semibold text-ink">How to play</h2>
      <div className="mt-3 space-y-3 text-sm text-ink-muted">
        <p>You&apos;re dealt 5 cards, same as the computer. Lower is better — the goal is to keep your hand&apos;s total value low.</p>
        <p><strong className="text-ink">Card values:</strong> number cards count as their face value. Aces and face cards (J, Q, K) count as 10.</p>
        <p><strong className="text-ink">Joker:</strong> each round one rank is picked at random as the joker. Any card of that rank is worth 0, for both players.</p>
        <p><strong className="text-ink">Your turn:</strong> draw a card from the deck or the discard pile, then discard one card from your hand.</p>
        <p><strong className="text-ink">Playing a set:</strong> if you hold two or more cards of the same rank, you can discard all of them at once instead of a normal turn — you only draw a single replacement card.</p>
        <p><strong className="text-ink">Calling:</strong> if you think your hand total is the lowest, call instead of drawing. If you&apos;re right, you score 0 for the round and your opponent scores their hand&apos;s value. If you&apos;re wrong, you&apos;re penalized {INCORRECT_CALL_PENALTY} points instead, and your opponent still scores their hand&apos;s value.</p>
        <p><strong className="text-ink">Winning:</strong> the first player to reach the target score loses — the other player wins.</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="mt-5 w-full rounded-lg bg-accent px-4 py-2.5 font-medium text-white transition-opacity hover:opacity-90"
      >
        Got it
      </button>
    </Modal>
  );
}
