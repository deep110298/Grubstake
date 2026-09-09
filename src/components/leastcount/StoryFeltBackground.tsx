// A fixed card-table backdrop for Story Mode's screens — deliberately not
// theme-reactive (same reasoning PlayingCard's paper tokens use: a felt
// table doesn't turn into a different table because the app's theme
// changed). Pinned with `fixed` rather than `absolute` so it always spans
// the true device viewport (including under the notch/status bar, now that
// layout.tsx sets viewportFit: "cover") regardless of how tall the
// scrollable content around it grows — an `absolute inset-0` sized to a
// tall scrolling parent left the safe-area strip showing body's plain
// canvas color instead of the felt.
export default function StoryFeltBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 70% at 50% -10%, #164649 0%, #0c2d2f 42%, #071a1c 78%, #051415 100%)',
        }}
      />
      <div
        className="absolute inset-0 mix-blend-screen"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, rgba(255,255,255,0.035) 0 1px, transparent 1px 34px), repeating-linear-gradient(-45deg, rgba(255,255,255,0.035) 0 1px, transparent 1px 34px)',
        }}
      />
      <span className="absolute left-[-8%] top-[4%] rotate-[-18deg] text-[140px] leading-none text-[#f5f1e8]/[0.05]" aria-hidden>
        ♠
      </span>
      <span className="absolute right-[-10%] top-[30%] rotate-[12deg] text-[110px] leading-none text-[#f5f1e8]/[0.05]" aria-hidden>
        ♦
      </span>
      <span className="absolute left-[-10%] top-[58%] rotate-[8deg] text-[120px] leading-none text-[#f5f1e8]/[0.05]" aria-hidden>
        ♣
      </span>
      <span className="absolute bottom-[3%] right-[-8%] rotate-[-10deg] text-[110px] leading-none text-[#f5f1e8]/[0.05]" aria-hidden>
        ♥
      </span>
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(120% 90% at 50% 25%, transparent 40%, rgba(0,0,0,0.4) 100%)' }}
      />
    </div>
  );
}
