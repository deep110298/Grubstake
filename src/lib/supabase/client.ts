import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

// Created lazily (not at module load) so pages that merely import this
// module — including ones statically prerendered at build time, before any
// env vars are necessarily available — don't crash just by importing it.
// Only code that actually needs Supabase (the Friends multiplayer feature)
// pays for a missing config, and only when it runs.
export function getSupabase(): SupabaseClient {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) {
      throw new Error(
        'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to use Play with Friends.'
      );
    }
    client = createClient(url, anonKey);
  }
  return client;
}
