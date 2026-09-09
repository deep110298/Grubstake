'use client';

import { useRouter } from 'next/navigation';
import Modal from './Modal';

export default function PauseModal({
  onResume,
  onRestart,
}: {
  onResume: () => void;
  onRestart?: () => void;
}) {
  const router = useRouter();

  return (
    <Modal>
      <div className="text-center">
        <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink">Paused</h2>
        <p className="mt-1.5 text-sm text-ink-muted">Take a breather — nothing moves until you resume.</p>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        <button
          type="button"
          onClick={onResume}
          className="w-full rounded-2xl bg-accent px-4 py-[18px] text-center font-bold text-lg text-white shadow-[0_5px_0_var(--accent-shadow)] transition-transform active:translate-y-[3px] active:shadow-[0_2px_0_var(--accent-shadow)]"
        >
          Resume
        </button>
        {onRestart && (
          <button
            type="button"
            onClick={onRestart}
            className="w-full rounded-2xl border-2 border-hairline-strong px-4 py-4 text-center font-semibold text-lg text-ink transition-colors hover:bg-surface-sunken"
          >
            Restart game
          </button>
        )}
        <button
          type="button"
          onClick={() => router.push('/')}
          className="w-full rounded-2xl border-2 border-hairline-strong px-4 py-4 text-center font-semibold text-lg text-ink transition-colors hover:bg-surface-sunken"
        >
          Exit to home
        </button>
      </div>
    </Modal>
  );
}
