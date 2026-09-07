# Least Count

Play the card game Least Count in the browser — against the computer, or
with friends in a shared room.

Keep your hand's total value low, call it when you think you're the lowest,
and beat the table to the target score. The vs-computer rules are matched to
[ckoppula199/Least-Count-Card-Game](https://github.com/ckoppula199/Least-Count-Card-Game),
the original text-based Java implementation; the friends mode generalizes
those same rules to 2-4 human players (see `src/lib/multiplayer/engine.ts`
for the specifics that had to be extrapolated).

## Getting Started

```bash
cp .env.local.example .env.local   # add your Supabase project URL + anon key
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Playing vs the computer needs no setup. Playing with friends needs a
Supabase project (free tier is enough) — create one, then fill in
`.env.local` with its API URL and anon/publishable key. The schema is two
tables, `rooms` and `room_players`; see the migration this project was set
up with for the exact SQL (rooms hold the room's config and the current
game state as JSON; room_players tracks who's seated and in what order).
Realtime must be enabled on both tables (`alter publication
supabase_realtime add table rooms, room_players;`) — that's what lets every
browser in a room see moves as they happen.

## How it's built

- Next.js (App Router) + Tailwind, mobile-first
- Solo game engine (`src/lib/leastCount/`): deck/card values, joker rank, turn resolution, calling and scoring for 2 players (you vs. computer)
- Computer opponent (`src/lib/leastCount/ai.ts`): a simple heuristic AI with graduated odds of calling as its hand value drops
- Multiplayer engine (`src/lib/multiplayer/engine.ts`): the same rules generalized to 2-4 players, used by friend rooms
- Rooms (`src/lib/multiplayer/`, backed by Supabase Postgres + Realtime): room codes, joining, and syncing game state between browsers — no accounts, just a per-browser id in localStorage
- UI (`src/components/leastcount/`): setup screen, game board, round/game-over modals, and (`friends/`) the room lobby and multiplayer board
