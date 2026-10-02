import { create } from 'zustand';

interface AdminState {
  isAdmin: boolean;
  isChecking: boolean;
  isLoginModalOpen: boolean;
  isAddTrackModalOpen: boolean;
  isAddPlaylistModalOpen: boolean;
  activeCategory: string;
  playlists: string[];

  // Actions
  checkAdminStatus: () => Promise<void>;
  login: (password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  setLoginModalOpen: (open: boolean) => void;
  setAddTrackModalOpen: (open: boolean) => void;
  setAddPlaylistModalOpen: (open: boolean) => void;
  setActiveCategory: (cat: string) => void;
  addPlaylist: (name: string) => void;
  triggerAddTrack: () => void;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  isAdmin: false,
  isChecking: false,
  isLoginModalOpen: false,
  isAddTrackModalOpen: false,
  isAddPlaylistModalOpen: false,
  activeCategory: 'all',
  playlists: ['Lo-fi Beats', 'Workout', 'Chill Vibes', 'Coding Focus'],

  checkAdminStatus: async () => {
    try {
      set({ isChecking: true });
      const res = await fetch('/api/admin/check');
      const data = await res.json();
      set({ isAdmin: Boolean(data.isAdmin), isChecking: false });
    } catch {
      set({ isAdmin: false, isChecking: false });
    }
  },

  login: async (password: string) => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        set({ isAdmin: true, isLoginModalOpen: false });
        return { success: true };
      }
      return { success: false, error: data.error || 'Incorrect password' };
    } catch {
      return { success: false, error: 'Network error occurred' };
    }
  },

  logout: async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      set({ isAdmin: false });
    } catch {
      set({ isAdmin: false });
    }
  },

  setLoginModalOpen: (open) => set({ isLoginModalOpen: open }),
  setAddTrackModalOpen: (open) => set({ isAddTrackModalOpen: open }),
  setAddPlaylistModalOpen: (open) => set({ isAddPlaylistModalOpen: open }),
  setActiveCategory: (cat) => set({ activeCategory: cat }),

  addPlaylist: (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    set((state) => {
      if (state.playlists.includes(trimmed)) return state;
      const updated = [...state.playlists, trimmed];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('hub_playlists', JSON.stringify(updated));
        } catch {}
      }
      return { playlists: updated };
    });
  },

  triggerAddTrack: () => {
    const { isAdmin } = get();
    if (isAdmin) {
      set({ isAddTrackModalOpen: true });
    } else {
      set({ isLoginModalOpen: true });
    }
  },
}));
