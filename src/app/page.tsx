import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-canvas px-4 py-10 text-center">
      <div>
        <h1 className="text-3xl font-semibold text-ink">Least Count</h1>
        <p className="mt-2 max-w-xs text-sm text-ink-muted">
          Keep your hand&apos;s value low, call when you think you&apos;re lowest, and beat the table.
        </p>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-2">
        <Link
          href="/play/computer"
          className="w-full rounded-lg bg-accent px-4 py-3 font-medium text-white transition-opacity hover:opacity-90"
        >
          Play vs Computer
        </Link>
        <Link
          href="/play/friends"
          className="w-full rounded-lg border border-hairline px-4 py-2.5 font-medium text-ink transition-colors hover:bg-surface-sunken"
        >
          Play with Friends
        </Link>
      </div>
    </div>
  );
}
