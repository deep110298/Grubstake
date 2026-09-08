'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const COLORS = ['#0a6f78', '#c2367f', '#d8324a', '#f2b705', '#ffffff'];
const PIECE_COUNT = 36;

interface Piece {
  id: number;
  left: number;
  color: string;
  width: number;
  height: number;
  delay: number;
  duration: number;
  rotate: number;
}

function makePieces(): Piece[] {
  return Array.from({ length: PIECE_COUNT }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    color: COLORS[i % COLORS.length],
    width: 6 + Math.random() * 5,
    height: 10 + Math.random() * 6,
    delay: Math.random() * 2.5,
    duration: 2.6 + Math.random() * 1.8,
    rotate: Math.random() > 0.5 ? 360 : -360,
  }));
}

// A gentle, looping confetti "rain" behind a celebration modal. Generates
// its randomized pieces client-side only (after mount) since this can be
// part of the initial server-rendered HTML — e.g. a Friends room fetched
// mid-"game-over" on page load — and Math.random() during render would
// otherwise produce a hydration mismatch between server and client.
export default function Confetti() {
  const [pieces, setPieces] = useState<Piece[] | null>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setTimeout(() => setPieces(makePieces()), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!pieces) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden" aria-hidden>
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ top: '-8%', left: `${p.left}%`, opacity: 1, rotate: 0 }}
          animate={{ top: '108%', rotate: p.rotate, opacity: [1, 1, 0.9, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            width: p.width,
            height: p.height,
            backgroundColor: p.color,
            borderRadius: 2,
          }}
        />
      ))}
    </div>
  );
}
