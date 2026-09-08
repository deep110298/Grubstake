'use client';

import Modal from '@/components/leastcount/Modal';

export default function MPPauseModal({
  onResume,
  onLeave,
}: {
  onResume: () => void;
  onLeave: () => void;
}) {
  return (
    <Modal>
      <div className="text-center">
        <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink">Paused</h2>
        <p className="mt-1.5 text-sm text-ink-muted">
          The game keeps going for everyone else — resume when you&apos;re ready.
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        <button
          type="button"
          onClick={onResume}
          className="w-full rounded-2xl bg-accent px-4 py-[18px] text-center font-bold text-lg text-white shadow-[0_5px_0_var(--accent-shadow)] transition-transform active:translate-y-[3px] active:shadow-[0_2px_0_var(--accent-shadow)]"
        >
          Resume
        </button>
        <button
          type="button"
          onClick={onLeave}
          className="w-full rounded-2xl border-2 border-hairline-strong px-4 py-4 text-center font-semibold text-lg text-ink transition-colors hover:bg-surface-sunken"
        >
          Exit to home
        </button>
      </div>
    </Modal>
  );
}
