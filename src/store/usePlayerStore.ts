import { create } from 'zustand';
import { Track } from '@/types/track';
import { INITIAL_TRACKS } from '@/lib/initialTracks';

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  playlist: Track[];
  volume: number;
  isMuted: boolean;
  progress: number; // in seconds
  duration: number; // in seconds
  isShuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  favorites: string[];

  // Actions
  setCurrentTrack: (track: Track) => void;
  playTrack: (track: Track, newPlaylist?: Track[]) => void;
  togglePlay: () => void;
  setIsPlaying: (playing: boolean) => void;
  setPlaylist: (tracks: Track[]) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  setProgress: (sec: number) => void;
  setDuration: (sec: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  toggleFavorite: (trackId: string) => void;
  isFavorite: (trackId: string) => boolean;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: INITIAL_TRACKS[0], // Default: drizzle by massobeats
  isPlaying: false,
  playlist: INITIAL_TRACKS,
  volume: 0.8,
  isMuted: false,
  progress: 0,
  duration: 180,
  isShuffle: false,
  repeatMode: 'all',
  favorites: ['yt-1', 'yt-2'],

  setCurrentTrack: (track) => set({ currentTrack: track }),

  playTrack: (track, newPlaylist) => {
    const state = get();
    set({
      currentTrack: track,
      isPlaying: true,
      playlist: newPlaylist || (state.playlist.length ? state.playlist : [track]),
      progress: 0,
    });
  },

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  setIsPlaying: (playing) => set({ isPlaying: playing }),

  setPlaylist: (tracks) => set({ playlist: tracks }),

  nextTrack: () => {
    const { playlist, currentTrack, isShuffle, repeatMode } = get();
    if (!playlist.length || !currentTrack) return;

    if (repeatMode === 'one') {
      set({ progress: 0, isPlaying: true });
      return;
    }

    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * playlist.length);
      set({ currentTrack: playlist[randomIndex], progress: 0, isPlaying: true });
      return;
    }

    const currentIndex = playlist.findIndex((t) => t.id === currentTrack.id);
    if (currentIndex === -1 || currentIndex === playlist.length - 1) {
      if (repeatMode === 'all') {
        set({ currentTrack: playlist[0], progress: 0, isPlaying: true });
      } else {
        set({ isPlaying: false });
      }
    } else {
      set({ currentTrack: playlist[currentIndex + 1], progress: 0, isPlaying: true });
    }
  },

  prevTrack: () => {
    const { playlist, currentTrack, progress } = get();
    if (!playlist.length || !currentTrack) return;

    // If played more than 3 seconds, restart current track
    if (progress > 3) {
      set({ progress: 0 });
      return;
    }

    const currentIndex = playlist.findIndex((t) => t.id === currentTrack.id);
    if (currentIndex > 0) {
      set({ currentTrack: playlist[currentIndex - 1], progress: 0, isPlaying: true });
    } else {
      set({ currentTrack: playlist[playlist.length - 1], progress: 0, isPlaying: true });
    }
  },

  setVolume: (vol) => set({ volume: Math.max(0, Math.min(1, vol)), isMuted: vol === 0 }),

  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

  setProgress: (sec) => set({ progress: sec }),

  setDuration: (sec) => set({ duration: sec }),

  toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),

  toggleRepeat: () =>
    set((state) => {
      const nextMode = state.repeatMode === 'off' ? 'all' : state.repeatMode === 'all' ? 'one' : 'off';
      return { repeatMode: nextMode };
    }),

  toggleFavorite: (trackId) =>
    set((state) => {
      const exists = state.favorites.includes(trackId);
      const newFavs = exists
        ? state.favorites.filter((id) => id !== trackId)
        : [...state.favorites, trackId];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('hub_favorites', JSON.stringify(newFavs));
        } catch {}
      }
      return { favorites: newFavs };
    }),

  isFavorite: (trackId) => get().favorites.includes(trackId),
}));
