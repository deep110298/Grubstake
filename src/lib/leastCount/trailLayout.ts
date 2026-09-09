// Procedural layout for the Story Mode level trail: node positions along a
// winding path, generated instead of hand-placed so it works for any level
// count without per-world authoring.

export const TRAIL_DESIGN_WIDTH = 340;

const STEP_Y = 118;
const TOP_PAD = 190;
const BOTTOM_PAD = 90;
const CENTER_X = TRAIL_DESIGN_WIDTH / 2;
const AMPLITUDE = 92;

export interface TrailPoint {
  x: number;
  y: number;
}

export function getTrailHeight(levelCount: number): number {
  return TOP_PAD + (levelCount - 1) * STEP_Y + BOTTOM_PAD;
}

// Level 1 nearest the top (natural reading order); later levels wind
// downward in a sine-wave S-curve.
export function getTrailPoints(levelCount: number): TrailPoint[] {
  const points: TrailPoint[] = [];
  for (let i = 0; i < levelCount; i++) {
    points.push({
      x: CENTER_X + AMPLITUDE * Math.sin(i * 1.15),
      y: TOP_PAD + i * STEP_Y,
    });
  }
  return points;
}

// Catmull-Rom-to-Bezier conversion so the path curves smoothly through
// every node instead of a jagged polyline.
export function buildSmoothPath(points: TrailPoint[]): string {
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
