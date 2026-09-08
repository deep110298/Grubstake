import { getSupabase } from '@/lib/supabase/client';
import { generateRoomCode } from './roomCodes';
import type { MPGameState, Room, RoomPlayerRow } from './types';

export class RoomServiceError extends Error {}

export async function createRoom(options: {
  hostPlayerId: string;
  hostName: string;
  maxPlayers: number;
  targetScore: number;
  background: string;
}): Promise<string> {
  const { hostPlayerId, hostName, maxPlayers, targetScore, background } = options;
  const supabase = getSupabase();

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateRoomCode();
    const { error: roomError } = await supabase.from('rooms').insert({
      code,
      host_player_id: hostPlayerId,
      max_players: maxPlayers,
      target_score: targetScore,
      background,
      status: 'lobby',
    });

    if (roomError) {
      if (roomError.code === '23505') continue; // code collision, try again
      throw new RoomServiceError(roomError.message);
    }

    const { error: playerError } = await supabase.from('room_players').insert({
      room_code: code,
      player_id: hostPlayerId,
      name: hostName,
      seat_index: 0,
      is_host: true,
    });
    if (playerError) throw new RoomServiceError(playerError.message);

    return code;
  }

  throw new RoomServiceError('Could not generate a unique room code. Please try again.');
}

export async function joinRoom(options: { code: string; playerId: string; name: string }): Promise<void> {
  const code = options.code.trim().toUpperCase();
  const supabase = getSupabase();

  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select('*')
    .eq('code', code)
    .maybeSingle();

  if (roomError) throw new RoomServiceError(roomError.message);
  if (!room) throw new RoomServiceError("That room code doesn't exist.");

  const { data: players, error: playersError } = await supabase
    .from('room_players')
    .select('*')
    .eq('room_code', code);
  if (playersError) throw new RoomServiceError(playersError.message);

  const already = players?.find((p) => p.player_id === options.playerId);
  if (already) return; // rejoining after a reload

  if (room.status !== 'lobby') {
    throw new RoomServiceError('That game has already started.');
  }
  if ((players?.length ?? 0) >= room.max_players) {
    throw new RoomServiceError('That room is full.');
  }

  const seatIndex = (players?.length ?? 0);
  const { error: insertError } = await supabase.from('room_players').insert({
    room_code: code,
    player_id: options.playerId,
    name: options.name,
    seat_index: seatIndex,
    is_host: false,
  });
  if (insertError) {
    if (insertError.code === '23505') {
      throw new RoomServiceError('Someone just took that spot — try joining again.');
    }
    throw new RoomServiceError(insertError.message);
  }
}

export async function getRoom(code: string): Promise<Room | null> {
  const { data, error } = await getSupabase().from('rooms').select('*').eq('code', code).maybeSingle();
  if (error) throw new RoomServiceError(error.message);
  return data as Room | null;
}

export async function getRoomPlayers(code: string): Promise<RoomPlayerRow[]> {
  const { data, error } = await getSupabase()
    .from('room_players')
    .select('*')
    .eq('room_code', code)
    .order('seat_index', { ascending: true });
  if (error) throw new RoomServiceError(error.message);
  return (data as RoomPlayerRow[]) ?? [];
}

export async function startGame(code: string, initialState: MPGameState): Promise<void> {
  const { error } = await getSupabase()
    .from('rooms')
    .update({ status: 'playing', game_state: initialState, updated_at: new Date().toISOString() })
    .eq('code', code);
  if (error) throw new RoomServiceError(error.message);
}

export async function updateGameState(code: string, state: MPGameState): Promise<void> {
  const { error } = await getSupabase()
    .from('rooms')
    .update({
      game_state: state,
      status: state.phase === 'game-over' ? 'finished' : 'playing',
      updated_at: new Date().toISOString(),
    })
    .eq('code', code);
  if (error) throw new RoomServiceError(error.message);
}

export function subscribeToRoom(code: string, onChange: () => void): () => void {
  const supabase = getSupabase();
  const channel = supabase
    .channel(`room:${code}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms', filter: `code=eq.${code}` }, onChange)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'room_players', filter: `room_code=eq.${code}` },
      onChange
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
