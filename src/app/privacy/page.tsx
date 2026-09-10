import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy — Least Count App',
};

const LAST_UPDATED = 'September 10, 2026';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-dvh bg-canvas px-6 pb-16 text-ink">
      <div className="mx-auto w-full max-w-xl">
        <div className="pt-[max(1rem,env(safe-area-inset-top))] pb-6">
          <Link href="/" className="mono-label text-xs font-bold text-ink-soft hover:text-ink">
            ← Home
          </Link>
        </div>

        <h1 className="font-display text-[32px] font-extrabold leading-tight tracking-tight">Privacy Policy</h1>
        <p className="mt-1.5 text-sm text-ink-muted">Last updated {LAST_UPDATED}</p>

        <div className="mt-8 flex flex-col gap-7 text-[15px] leading-relaxed text-ink-soft">
          <section>
            <p>
              Least Count App (&ldquo;the app&rdquo;) is a card game you can play against the computer or with
              friends. This page explains what information the app collects, why, and how you can control it. We
              built the app to need as little of your information as possible — there is no account system, no
              ads, and no analytics or tracking of any kind.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-ink">Information the app stores on your device</h2>
            <p className="mt-2">
              The app saves a few things directly in your device&apos;s local storage, which never leaves your
              device on its own:
            </p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5">
              <li>The display name you type in (e.g. for &ldquo;Play vs Computer&rdquo; or &ldquo;Play with Friends&rdquo;)</li>
              <li>A random, anonymous ID generated for your device, used only to recognize you within a game room you&apos;re playing in</li>
              <li>Your progress in Story Mode and the Daily Challenge (levels cleared, stars, streaks)</li>
              <li>Your light/dark theme preference</li>
            </ul>
            <p className="mt-2">
              None of this identifies you personally — it&apos;s tied to your device, not to your name, email, or
              any account. You can clear it at any time by clearing your browser or app storage.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-ink">Information used for Friends mode</h2>
            <p className="mt-2">
              When you create or join a room in Friends mode, your display name and the random device ID above are
              sent to our backend (Supabase) so the app can show who&apos;s in the room and sync the game in real
              time between players. We also store the game state itself (cards, scores, round results) for the
              room while it&apos;s active. Quick-chat messages sent during a game (the preset &ldquo;Hurry up!&rdquo;-style
              messages) are broadcast live to players in that room and are not saved anywhere.
            </p>
            <p className="mt-2">
              This information is only sent when you actively use Friends mode — vs-Computer, Story Mode, and the
              Daily Challenge never contact our servers with anything about you.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-ink">Third-party services</h2>
            <p className="mt-2">
              We use{' '}
              <a
                href="https://supabase.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent underline underline-offset-2"
              >
                Supabase
              </a>{' '}
              to host the database and real-time connection that Friends mode relies on. We don&apos;t use any
              advertising, analytics, or tracking services — nothing about your usage of the app is sold or shared
              with third parties for marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-ink">Data retention &amp; deletion</h2>
            <p className="mt-2">
              Local storage on your device stays until you clear it yourself. Room data in Friends mode is tied to
              the room you played in and isn&apos;t linked to any real-world identity, so there&apos;s nothing to
              delete on our end that could identify you — but if you&apos;d like us to remove any data associated
              with a device ID or room, contact us at the email below and we&apos;ll take care of it.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-ink">Children&apos;s privacy</h2>
            <p className="mt-2">
              The app doesn&apos;t knowingly collect any information from children, and since there&apos;s no
              account system or real-identity information collected at all, no personal information is gathered
              from any user regardless of age beyond what&apos;s described above.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-ink">Changes to this policy</h2>
            <p className="mt-2">
              If this policy changes, we&apos;ll update the date at the top of this page. Continuing to use the app
              after a change means you accept the updated policy.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-ink">Contact</h2>
            <p className="mt-2">
              Questions about this policy or your data? Reach out at{' '}
              <a href="mailto:shahdeep276@gmail.com" className="text-accent underline underline-offset-2">
                shahdeep276@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
