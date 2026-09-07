import type { Metadata } from 'next';
import GameBoard from '@/components/leastcount/GameBoard';

export const metadata: Metadata = {
  title: 'Least Count — Grubstake',
  description: 'Play Least Count against the computer: keep your hand low, call it, and win.',
};

export default function LeastCountPage() {
  return <GameBoard />;
}
