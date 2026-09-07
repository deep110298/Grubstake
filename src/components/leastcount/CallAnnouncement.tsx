export default function CallAnnouncement({ callerLabel }: { callerLabel: string }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="call-pop flex flex-col items-center gap-2 rounded-[28px] bg-surface px-9 py-8 text-center shadow-2xl">
        <span className="text-4xl" aria-hidden>
          🃏
        </span>
        <h2 className="font-display text-2xl font-extrabold leading-tight tracking-tight text-ink">
          {callerLabel} calls
          <br />
          Least Count!
        </h2>
      </div>
    </div>
  );
}
