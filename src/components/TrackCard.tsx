'use client';

import React from 'react';
import Image from 'next/image';
import { Play, Pause, Heart, Trash2, Music } from 'lucide-react';
import { Track } from '@/types/track';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useAdminStore } from '@/store/useAdminStore';

interface TrackCardProps {
  track: Track;
  playlist: Track[];
  onDelete?: (id: string) => void;
}

export default function TrackCard({ track, playlist, onDelete }: TrackCardProps) {
  const { currentTrack, isPlaying, playTrack, togglePlay, toggleFavorite, isFavorite } =
    usePlayerStore();
  const { isAdmin } = useAdminStore();

  const isCurrent = currentTrack?.id === track.id;
  const isCardPlaying = isCurrent && isPlaying;
  const isFav = isFavorite(track.id);

  const handleCardClick = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track, playlist);
    }
  };

  const getGenreStyle = (genre: string) => {
    const g = genre.toLowerCase();
    if (g.includes('synth')) {
      return 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30 shadow-[0_0_8px_rgba(6,182,212,0.2)]';
    }
    if (g.includes('folk')) {
      return 'bg-teal-500/20 text-teal-300 border-teal-400/30 shadow-[0_0_8px_rgba(20,184,166,0.2)]';
    }
    if (g.includes('piano')) {
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30 shadow-[0_0_8px_rgba(16,185,129,0.2)]';
    }
    if (g.includes('chill')) {
      return 'bg-sky-500/20 text-sky-300 border-sky-400/30 shadow-[0_0_8px_rgba(14,165,233,0.2)]';
    }
    if (g.includes('lo-fi') || g.includes('lofi')) {
      return 'bg-purple-500/20 text-purple-300 border-purple-400/30 shadow-[0_0_8px_rgba(168,85,247,0.2)]';
    }
    return 'bg-pink-500/20 text-pink-300 border-pink-400/30 shadow-[0_0_8px_rgba(236,72,153,0.2)]';
  };

  const [imgError, setImgError] = React.useState(false);

  return (
    <div
      onClick={handleCardClick}
      className={`group relative flex items-center gap-3.5 p-3 rounded-2xl cursor-pointer transition-all duration-300 border ${
        isCurrent
          ? 'bg-[#181534]/90 border-cyan-400/80 shadow-[0_0_24px_rgba(34,211,238,0.3)] ring-1 ring-cyan-400/40'
          : 'bg-[#121026]/70 hover:bg-[#191535]/80 border-purple-500/20 hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:-translate-y-0.5'
      }`}
    >
      {/* Thumbnail Left */}
      <div className="relative w-16 h-16 sm:w-18 sm:h-18 flex-shrink-0 rounded-xl overflow-hidden bg-purple-950/40 border border-purple-500/20 flex items-center justify-center">
        {track.thumbnail_url && !imgError ? (
          <img
            src={track.thumbnail_url}
            alt={track.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          /* Stylish Neon Vinyl Disc Fallback (when no image exists) */
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-[#170e33] via-[#221045] to-[#0f2238] relative overflow-hidden group-hover:from-purple-900/40">
            {/* Vinyl record grooves */}
            <div className="absolute inset-1 rounded-full border border-purple-400/20 pointer-events-none" />
            <div className="absolute inset-3 rounded-full border border-cyan-400/20 pointer-events-none" />
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center shadow-[0_0_12px_rgba(34,211,238,0.6)]">
              <Music className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
        )}

        {/* Hover / Playing Overlay */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-all ${
            isCardPlaying
              ? 'bg-black/40 opacity-100'
              : 'bg-black/40 opacity-0 group-hover:opacity-100'
          }`}
        >
          {isCardPlaying ? (
            <div className="flex items-end justify-center gap-0.5 h-5">
              <span className="w-1 bg-cyan-400 animate-[bounce_0.8s_infinite] h-5 rounded-full" />
              <span className="w-1 bg-cyan-300 animate-[bounce_1.1s_infinite_0.2s] h-3 rounded-full" />
              <span className="w-1 bg-purple-400 animate-[bounce_0.9s_infinite_0.4s] h-4 rounded-full" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-cyan-400/90 text-black flex items-center justify-center shadow-[0_0_12px_rgba(34,211,238,0.8)] transform scale-90 group-hover:scale-100 transition-transform">
              <Play className="w-4 h-4 ml-0.5 fill-black" />
            </div>
          )}
        </div>
      </div>

      {/* Info Right */}
      <div className="flex-1 min-w-0 pr-6">
        <h3
          className={`text-sm font-semibold truncate transition-colors ${
            isCurrent ? 'text-cyan-300 drop-shadow-[0_0_6px_rgba(34,211,238,0.5)]' : 'text-white group-hover:text-cyan-300'
          }`}
        >
          {track.title}
        </h3>
        <p className="text-xs text-purple-300/70 truncate mt-0.5 font-normal">
          {track.artist}
        </p>

        {/* Genre Pill Tag */}
        <div className="mt-2 flex items-center gap-2">
          <span
            className={`inline-block px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full border ${getGenreStyle(
              track.genre
            )}`}
          >
            {track.genre}
          </span>
        </div>
      </div>

      {/* Actions (Top Right) */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
        {/* Favorite Button */}
        <button
          onClick={() => toggleFavorite(track.id)}
          title={isFav ? 'Remove from favorites' : 'Add to favorites'}
          className={`p-1.5 rounded-lg transition-colors ${
            isFav
              ? 'text-pink-400 hover:text-pink-300 drop-shadow-[0_0_6px_rgba(244,63,94,0.6)]'
              : 'text-purple-400/40 hover:text-pink-400 opacity-0 group-hover:opacity-100'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-pink-400' : ''}`} />
        </button>

        {/* Delete Button (Only for Admin) */}
        {isAdmin && onDelete && (
          <button
            onClick={() => {
              if (confirm(`Bạn có chắc chắn muốn xoá bài hát "${track.title}" không?`)) {
                onDelete(track.id);
              }
            }}
            title="Xoá bài hát (Admin)"
            className="p-1.5 rounded-lg text-purple-400/40 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-950/30"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
