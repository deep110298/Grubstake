// A dashed line threading through `count` nodes laid out in a vertical flex
// column above it, echoing the same left/right wiggle the nodes themselves
// use (see OFFSETS in StoryWorldMap/StoryLevelMap). Coordinates are in a
// 0-100-wide, 0-count-tall unit space stretched to fill the actual node
// list's box via preserveAspectRatio="none", so it holds up at any node
// count or viewport width without needing to measure real pixel positions.
const CONNECTOR_OFFSETS = [0, 9, 0, -9];

export default function StoryPathConnector({ count }: { count: number }) {
  if (count < 2) return null;

  const points = Array.from({ length: count }, (_, i) => ({
    x: 50 + CONNECTOR_OFFSETS[i % CONNECTOR_OFFSETS.length],
    y: i + 0.5,
  }));

  let d = `M ${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const midY = (prev.y + curr.y) / 2;
    d += ` C ${prev.x},${midY} ${curr.x},${midY} ${curr.x},${curr.y}`;
  }

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox={`0 0 100 ${count}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        d={d}
        fill="none"
        stroke="rgba(232,184,75,0.35)"
        strokeWidth="1.4"
        strokeDasharray="1.5 6"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
