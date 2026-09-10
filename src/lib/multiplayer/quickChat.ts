import { getSupabase } from '@/lib/supabase/client';

// A short, curated set rather than free text — no moderation surface, no
// typing on a phone mid-round, matches the room's existing player names.
export const QUICK_CHAT_MESSAGES = ['Hurry up!', 'Good one!', 'Nice try!', 'Oops!', 'GG!'] as const;

export interface QuickChatEvent {
  playerId: string;
  name: string;
  text: string;
}

// A dedicated broadcast-only channel, separate from the room's
// postgres_changes subscription (roomService.subscribeToRoom) — these pings
// are ephemeral and never touch the database, so they don't belong on the
// same topic as persisted game state.
export function subscribeToQuickChat(code: string, onMessage: (event: QuickChatEvent) => void) {
  const supabase = getSupabase();
  const channel = supabase
    .channel(`room:${code}:chat`)
    .on('broadcast', { event: 'quick_chat' }, ({ payload }) => onMessage(payload as QuickChatEvent))
    .subscribe();

  return {
    send: (event: QuickChatEvent) => channel.send({ type: 'broadcast', event: 'quick_chat', payload: event }),
    unsubscribe: () => supabase.removeChannel(channel),
  };
}
