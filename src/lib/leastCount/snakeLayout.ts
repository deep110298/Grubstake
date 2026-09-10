// Procedural layout for a winding "snake" path of nodes (Story Mode's world
// map) — positions generated instead of hand-placed so it works for any
// node count without per-node authoring.

export const SNAKE_DESIGN_WIDTH = 340;

const STEP_Y = 105;
const TOP_PAD = 40;
const BOTTOM_PAD = 60;
const CENTER_X = SNAKE_DESIGN_WIDTH / 2;
const AMPLITUDE = 90;

export interface SnakePoint {
  x: number;
  y: number;
}

export function getSnakeHeight(count: number): number {
  return TOP_PAD + (count - 1) * STEP_Y + BOTTOM_PAD;
}

// First node nearest the top (natural reading order); later nodes wind
// downward in a sine-wave S-curve.
export function getSnakePoints(count: number): SnakePoint[] {
  const points: SnakePoint[] = [];
  for (let i = 0; i < count; i++) {
    points.push({
      x: CENTER_X + AMPLITUDE * Math.sin(i * 1.15),
      y: TOP_PAD + i * STEP_Y,
    });
  }
  return points;
}

// Catmull-Rom-to-Bezier conversion so the path curves smoothly through
// every node instead of a jagged polyline.
export function buildSmoothPath(points: SnakePoint[]): string {
  if (points.length < 2) return '';
  const d: string[] = [`M ${points[0].x} ${points[0].y}`];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d.push(`C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`);
  }
  return d.join(' ');
}
