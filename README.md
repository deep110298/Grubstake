# Least Count App

Play the card game Least Count in the browser — against the computer, or
with friends in a shared room. Live at **[leastcountapp.com](https://leastcountapp.com)**.

Keep your hand's total value low, call it when you think you're the lowest,
and beat the table to the target score. The vs-computer rules are matched to
[ckoppula199/Least-Count-Card-Game](https://github.com/ckoppula199/Least-Count-Card-Game),
the original text-based Java implementation; the friends mode uses the
commonly-played standard rules for 2-6 human players instead (see
`src/lib/multiplayer/engine.ts` for specifics, including the Joker cards,
declare threshold, and player-elimination endgame that come with it).

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
- Multiplayer engine (`src/lib/multiplayer/engine.ts`): the standard Least Count rules for 2-6 players, used by friend rooms
- Rooms (`src/lib/multiplayer/`, backed by Supabase Postgres + Realtime): room codes, joining, and syncing game state between browsers — no accounts, just a per-browser id in localStorage
- UI (`src/components/leastcount/`): setup screen, game board (with pause/restart/exit), round/game-over modals, and (`friends/`) the room lobby and multiplayer board

## Shipping to the App Store / Play Store

This is a web app wrapped for native app stores with
[Capacitor](https://capacitorjs.com) — the `ios/` and `android/` folders
are real, committed native projects, already pointed at the production
site (`capacitor.config.ts`) and branded with the app's icon and splash
screen.

**iOS needs a Mac with Xcode.** There's no way around that — Apple only
lets you build and submit iOS apps from Xcode.

1. **Enroll in the Apple Developer Program** — [developer.apple.com](https://developer.apple.com/programs/),
   $99/year, tied to your own Apple ID.
2. **Clone this repo on your Mac** and run:
   ```bash
   npm install
   npx cap sync ios
   npm run cap:ios   # opens ios/App/App.xcworkspace in Xcode
   ```
3. **In Xcode**: select the `App` target → *Signing & Capabilities* → set
   your Team (from step 1). Xcode will provision it automatically.
4. **Bump the version/build number** (General tab) for each submission.
5. **Product → Archive**, then use the Organizer window's *Distribute App*
   flow to upload to App Store Connect.
6. **In [App Store Connect](https://appstoreconnect.apple.com)**: create the
   app listing (name, screenshots, description, privacy policy URL — you'll
   need to host one, even a simple static page saying what data the app
   collects), set an age rating, and submit the build for review.
7. Optional but recommended: send it through **TestFlight** first so you
   (or a few friends) can try the real build before it goes out for review.

**Android** is similar but the tooling runs cross-platform:

1. **Create a Google Play Console account** — [play.google.com/console](https://play.google.com/console/signup),
   $25 one-time.
2. On any machine with [Android Studio](https://developer.android.com/studio):
   ```bash
   npm install
   npx cap sync android
   npm run cap:android   # opens the android/ project in Android Studio
   ```
3. **Build → Generate Signed App Bundle**, creating (and safely keeping —
   losing it means you can never update the app again) your own signing key.
4. Upload the `.aab` to a new release in Play Console, fill in the store
   listing, and submit for review.

A few things worth knowing about this setup:

- The app loads `https://leastcountapp.com` directly in a native WebView
  (see `server.url` in `capacitor.config.ts`) rather than bundling a local
  copy of the site. That means **pushing to `main` updates the live app
  everywhere immediately** — no app store re-submission needed for regular
  changes. You only need to rebuild/resubmit for things Capacitor itself
  controls: the app icon, splash screen, bundle ID/version, or native
  permissions.
- Both app stores require a **privacy policy URL** during listing setup.
  Since this app only stores a per-browser id and a display name (no
  accounts, no tracking), a short static page describing that is enough —
  it just needs to be hosted somewhere public.
- The bundle ID/application ID is set to `com.leastcountapp.app` in
  `capacitor.config.ts`. It's effectively permanent once you submit, so
  change it there (and re-run `npx cap sync`) before your first submission
  if you'd rather use something else.
