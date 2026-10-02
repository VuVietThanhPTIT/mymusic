'use client';

import React, { useState, useEffect, useMemo } from 'react';
import StarfieldBackground from '@/components/StarfieldBackground';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import TrackGrid from '@/components/TrackGrid';
import BottomPlayer from '@/components/BottomPlayer';
import AdminLoginModal from '@/components/AdminLoginModal';
import AddTrackModal from '@/components/AddTrackModal';
import AddPlaylistModal from '@/components/AddPlaylistModal';
import { Track, SortOption } from '@/types/track';
import { INITIAL_TRACKS } from '@/lib/initialTracks';
import { useAdminStore } from '@/store/useAdminStore';
import { usePlayerStore } from '@/store/usePlayerStore';

export default function HomePage() {
  const [tracks, setTracks] = useState<Track[]>(INITIAL_TRACKS);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('alphabetical');

  const { activeCategory, checkAdminStatus } = useAdminStore();
  const { favorites, setPlaylist } = usePlayerStore();

  // Load initial tracks from API
  useEffect(() => {
    checkAdminStatus();

    const fetchTracks = async () => {
      try {
        const res = await fetch('/api/tracks');
        if (res.ok) {
          const data = await res.json();
          if (data.tracks && data.tracks.length > 0) {
            setTracks(data.tracks);
            setPlaylist(data.tracks);
          }
        }
      } catch (err) {
        console.warn('Using local initial tracks fallback:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTracks();
  }, [checkAdminStatus, setPlaylist]);

  // Handle adding a new track
  const handleTrackAdded = (newTrack: Track) => {
    setTracks((prev) => [newTrack, ...prev]);
    setPlaylist([newTrack, ...tracks]);
  };

  // Handle deleting a track
  const handleDeleteTrack = async (id: string) => {
    try {
      const res = await fetch(`/api/tracks/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        setTracks((prev) => prev.filter((t) => t.id !== id));
      } else {
        alert(data.error || 'Không thể xoá bài hát');
      }
    } catch {
      alert('Lỗi kết nối khi xoá bài hát');
    }
  };

  // Filtered and sorted tracks
  const filteredTracks = useMemo(() => {
    let result = [...tracks];

    // Filter by Sidebar Category / Playlist
    if (activeCategory === 'favorites') {
      result = result.filter((t) => favorites.includes(t.id));
    } else if (activeCategory === 'study') {
      result = result.filter((t) => {
        const g = t.genre.toLowerCase();
        return g.includes('piano') || g.includes('lo-fi') || g.includes('chill') || g.includes('ambient');
      });
    } else if (activeCategory === 'new') {
      result = result.slice(0, 8); // Top recent releases
    } else if (activeCategory === 'Lo-fi Beats') {
      result = result.filter((t) => t.genre.toLowerCase().includes('lo-fi') || t.genre.toLowerCase().includes('lofi'));
    } else if (activeCategory === 'Workout') {
      result = result.filter((t) => t.genre.toLowerCase().includes('synth') || t.genre.toLowerCase().includes('workout'));
    } else if (activeCategory !== 'all') {
      // Custom category/playlist match
      result = result.filter((t) => t.genre.toLowerCase().includes(activeCategory.toLowerCase()));
    }

    // Filter by search keyword
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.artist.toLowerCase().includes(q) ||
          t.genre.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortBy === 'alphabetical') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'artist') {
      result.sort((a, b) => a.artist.localeCompare(b.artist));
    } else if (sortBy === 'latest') {
      result.sort((a, b) => {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return timeB - timeA;
      });
    }

    return result;
  }, [tracks, activeCategory, favorites, searchTerm, sortBy]);

  return (
    <div className="relative min-h-screen flex text-white overflow-x-hidden font-sans">
      {/* Animated Starfield Canvas */}
      <StarfieldBackground />

      {/* Left Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 px-6 py-6 pb-32">
        <Header
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        <TrackGrid
          tracks={filteredTracks}
          isLoading={loading}
          onDeleteTrack={handleDeleteTrack}
        />
      </main>

      {/* Bottom Audio Player Bar */}
      <BottomPlayer />

      {/* Dialog Modals */}
      <AdminLoginModal />
      <AddTrackModal onTrackAdded={handleTrackAdded} />
      <AddPlaylistModal />
    </div>
  );
}
