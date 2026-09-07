# Least Count

Play the card game Least Count against the computer, right in the browser.

Keep your hand's total value low, call it when you think you're the lowest,
and beat the computer to the target score. Rules are matched to
[ckoppula199/Least-Count-Card-Game](https://github.com/ckoppula199/Least-Count-Card-Game),
the original text-based Java implementation.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How it's built

- Next.js (App Router) + Tailwind, mobile-first, single-session (no accounts, no server state)
- Game engine (`src/lib/leastCount/`): deck/card values, joker rank, turn resolution, calling and scoring
- Computer opponent (`src/lib/leastCount/ai.ts`): a simple heuristic AI with graduated odds of calling as its hand value drops
- UI (`src/components/leastcount/`): setup screen, game board, and round/game-over modals
