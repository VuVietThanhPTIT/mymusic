import { Track } from '@/types/track';
import { INITIAL_TRACKS } from '@/lib/initialTracks';
import { getServiceSupabase, isSupabaseConfigured } from '@/lib/supabase';

// In-memory fallback cache for development or when Supabase is not yet configured
let memoryTracks: Track[] = [...INITIAL_TRACKS];

export async function getAllTracks(options?: {
  search?: string;
  genre?: string;
  sort?: string;
}): Promise<Track[]> {
  const { search = '', genre = '', sort = 'latest' } = options || {};

  if (isSupabaseConfigured) {
    const supabase = getServiceSupabase();
    if (supabase) {
      let query = supabase.from('tracks').select('*');

      if (genre && genre !== 'all') {
        query = query.ilike('genre', `%${genre}%`);
      }

      if (search) {
        query = query.or(`title.ilike.%${search}%,artist.ilike.%${search}%,genre.ilike.%${search}%`);
      }

      if (sort === 'alphabetical') {
        query = query.order('title', { ascending: true });
      } else if (sort === 'artist') {
        query = query.order('artist', { ascending: true });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as Track[];
      }
      // If table is empty or error, fallback to memory
    }
  }

  // Fallback to memory
  let results = [...memoryTracks];

  if (genre && genre !== 'all') {
    results = results.filter((t) => t.genre.toLowerCase() === genre.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    results = results.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.genre.toLowerCase().includes(q)
    );
  }

  if (sort === 'alphabetical') {
    results.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sort === 'artist') {
    results.sort((a, b) => a.artist.localeCompare(b.artist));
  } else {
    results.sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    });
  }

  return results;
}

export async function addTrack(newTrack: Omit<Track, 'id' | 'created_at'>): Promise<Track> {
  const trackId = `track-${Date.now()}`;
  const now = new Date().toISOString();

  const record: Track = {
    ...newTrack,
    id: trackId,
    created_at: now,
  };

  if (isSupabaseConfigured) {
    const supabase = getServiceSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('tracks')
        .insert([
          {
            title: record.title,
            artist: record.artist,
            source_url: record.source_url,
            thumbnail_url: record.thumbnail_url,
            genre: record.genre,
          },
        ])
        .select()
        .single();

      if (!error && data) {
        return data as Track;
      }
      console.warn('Supabase insert warning, saved to memory instead:', error);
    }
  }

  // Prepend to memory
  memoryTracks.unshift(record);
  return record;
}

export async function deleteTrack(id: string): Promise<boolean> {
  if (isSupabaseConfigured) {
    const supabase = getServiceSupabase();
    if (supabase) {
      const { error } = await supabase.from('tracks').delete().eq('id', id);
      if (!error) {
        memoryTracks = memoryTracks.filter((t) => t.id !== id);
        return true;
      }
      console.warn('Supabase delete error:', error);
    }
  }

  memoryTracks = memoryTracks.filter((t) => t.id !== id);
  return true;
}
