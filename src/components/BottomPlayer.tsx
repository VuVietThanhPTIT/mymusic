'use client';

import React, { useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Volume1,
  ListMusic,
  Heart,
  Music,
  Tv,
} from 'lucide-react';
import { usePlayerStore } from '@/store/usePlayerStore';

import YouTubeAudioEngine from './YouTubeAudioEngine';

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function getPlayableUrl(url: string): string {
  if (!url) return '';
  if (url.includes('music.youtube.com')) {
    return url.replace('music.youtube.com', 'www.youtube.com');
  }
  return url;
}

export default function BottomPlayer() {
  const {
    currentTrack,
    isPlaying,
    volume,
    isMuted,
    progress,
    duration,
    isShuffle,
    repeatMode,
    togglePlay,
    setIsPlaying,
    nextTrack,
    prevTrack,
    setVolume,
    toggleMute,
    setProgress,
    setDuration,
    toggleShuffle,
    toggleRepeat,
    toggleFavorite,
    isFavorite,
    playlist,
    playTrack,
  } = usePlayerStore();

  const playerRef = useRef<any>(null);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekTime, setSeekTime] = useState(0);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [playerImgError, setPlayerImgError] = useState(false);
  const [showMiniPlayer, setShowMiniPlayer] = useState(true);
  const [playbackError, setPlaybackError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setPlayerImgError(false);
  }, [currentTrack?.id]);

  if (!mounted || !currentTrack) return null;

  const isFav = isFavorite(currentTrack.id);

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setSeekTime(val);
    setIsSeeking(true);
  };

  const handleSeekCommit = () => {
    setIsSeeking(false);
    setProgress(seekTime);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('player_seek', { detail: seekTime }));
    }
  };

  const handleProgress = (state: { playedSeconds: number; loadedSeconds: number }) => {
    if (!isSeeking) {
      setProgress(state.playedSeconds);
    }
  };

  const handleDuration = (dur: number) => {
    if (dur && dur > 0) {
      setDuration(dur);
    }
  };

  const currentSeconds = isSeeking ? seekTime : progress;
  const progressPercent = duration > 0 ? (currentSeconds / duration) * 100 : 0;

  // Visualizer animated bars count
  const leftBars = [14, 28, 45, 65, 38, 55, 75, 90, 60, 40, 25, 18];
  const rightBars = [18, 30, 50, 70, 45, 60, 80, 85, 55, 35, 20, 15];

  return (
    <>
      {/* Real YouTube Audio & Video Engine (Official Iframe API) */}
      <YouTubeAudioEngine
        showMiniPlayer={showMiniPlayer}
        onToggleMiniPlayer={() => setShowMiniPlayer(!showMiniPlayer)}
      />

      {/* Main Fixed Bottom Player Bar */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 h-24 bg-[#0a0818]/90 backdrop-blur-2xl border-t border-purple-500/25 px-4 md:px-8 flex items-center justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.6)] select-none">
        {/* Left: Current Track Info */}
        <div className="flex items-center gap-3.5 w-1/4 min-w-[200px]">
          <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-purple-950/60 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.3)] flex items-center justify-center">
            {currentTrack.thumbnail_url && !playerImgError ? (
              <img
                src={currentTrack.thumbnail_url}
                alt={currentTrack.title}
                onError={() => setPlayerImgError(true)}
                className={`w-full h-full object-cover transition-transform duration-700 ${
                  isPlaying ? 'scale-105' : 'scale-100'
                }`}
              />
            ) : (
              /* Glowing Vinyl Record */
              <div className={`w-full h-full flex items-center justify-center bg-gradient-to-tr from-[#120a28] via-[#1f103b] to-[#0a1e30] relative ${isPlaying ? 'animate-[spin_6s_linear_infinite]' : ''}`}>
                <div className="absolute inset-1 rounded-full border border-purple-400/20" />
                <div className="absolute inset-2.5 rounded-full border border-cyan-400/20" />
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-600 flex items-center justify-center shadow-[0_0_8px_rgba(34,211,238,0.7)]">
                  <Music className="w-2.5 h-2.5 text-white" />
                </div>
              </div>
            )}
          </div>

          <div className="min-w-0 pr-2">
            <h4 className="text-sm font-semibold text-white truncate drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
              {currentTrack.title}
            </h4>
            <p className="text-xs text-purple-300/70 truncate mt-0.5 font-normal">
              {currentTrack.artist}
            </p>
          </div>

          <button
            onClick={() => toggleFavorite(currentTrack.id)}
            title={isFav ? 'Remove from favorites' : 'Add to favorites'}
            className="p-1 text-purple-400 hover:text-pink-400 transition-colors"
          >
            <Heart className={`w-4 h-4 ${isFav ? 'text-pink-400 fill-pink-400' : ''}`} />
          </button>
        </div>

        {/* Center: Waveform, Play Controls & Seek Bar */}
        <div className="flex-1 max-w-2xl px-4 flex flex-col items-center justify-center gap-1.5">
          {/* Top Row: Left Waveform - Controls - Right Waveform */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 w-full">
            {/* Left Cyan Waveform Visualizer */}
            <div className="hidden lg:flex items-center gap-0.5 h-6">
              {leftBars.map((height, i) => (
                <span
                  key={`left-${i}`}
                  style={{
                    height: isPlaying ? `${Math.max(15, (height * (0.6 + Math.sin(progress * 4 + i) * 0.4)))}%` : '20%',
                    transition: 'height 0.15s ease',
                  }}
                  className="w-0.5 sm:w-1 bg-gradient-to-t from-cyan-600 to-cyan-300 rounded-full shadow-[0_0_6px_rgba(34,211,238,0.7)]"
                />
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3 sm:gap-5">
              {/* Shuffle */}
              <button
                onClick={toggleShuffle}
                title={isShuffle ? 'Shuffle: On' : 'Shuffle: Off'}
                className={`p-1.5 transition-colors ${
                  isShuffle
                    ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]'
                    : 'text-purple-300/60 hover:text-white'
                }`}
              >
                <Shuffle className="w-4 h-4" />
              </button>

              {/* Prev */}
              <button
                onClick={prevTrack}
                title="Previous Track"
                className="p-1.5 text-purple-200/80 hover:text-cyan-300 transition-colors"
              >
                <SkipBack className="w-5 h-5 fill-current" />
              </button>

              {/* Play / Pause (Neon Button) */}
              <button
                onClick={togglePlay}
                title={isPlaying ? 'Pause' : 'Play'}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white text-black hover:bg-cyan-300 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.7)] hover:shadow-[0_0_25px_rgba(34,211,238,0.9)] transition-all transform active:scale-95"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-black" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5 fill-black" />
                )}
              </button>

              {/* Next */}
              <button
                onClick={nextTrack}
                title="Next Track"
                className="p-1.5 text-purple-200/80 hover:text-cyan-300 transition-colors"
              >
                <SkipForward className="w-5 h-5 fill-current" />
              </button>

              {/* Repeat */}
              <button
                onClick={toggleRepeat}
                title={`Repeat: ${repeatMode}`}
                className={`p-1.5 transition-colors ${
                  repeatMode !== 'off'
                    ? 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]'
                    : 'text-purple-300/60 hover:text-white'
                }`}
              >
                {repeatMode === 'one' ? (
                  <Repeat1 className="w-4 h-4 text-cyan-400" />
                ) : (
                  <Repeat className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Right Magenta/Purple Waveform Visualizer */}
            <div className="hidden lg:flex items-center gap-0.5 h-6">
              {rightBars.map((height, i) => (
                <span
                  key={`right-${i}`}
                  style={{
                    height: isPlaying ? `${Math.max(15, (height * (0.6 + Math.cos(progress * 4 + i) * 0.4)))}%` : '20%',
                    transition: 'height 0.15s ease',
                  }}
                  className="w-0.5 sm:w-1 bg-gradient-to-t from-purple-600 to-pink-400 rounded-full shadow-[0_0_6px_rgba(236,72,153,0.7)]"
                />
              ))}
            </div>
          </div>

          {/* Bottom Row: Seek Bar & Timers */}
          <div className="w-full flex items-center gap-3">
            <span className="text-[11px] font-mono text-purple-300/70 w-9 text-right">
              {formatTime(currentSeconds)}
            </span>

            {/* Seek Bar Slider */}
            <div className="relative flex-1 flex items-center h-4 group cursor-pointer">
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.5}
                value={currentSeconds}
                onChange={handleSeekChange}
                onMouseUp={handleSeekCommit}
                onTouchEnd={handleSeekCommit}
                className="w-full h-1 bg-purple-950/60 rounded-full appearance-none cursor-pointer focus:outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-300 [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(34,211,238,1)] [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:scale-0 group-hover:[&::-webkit-slider-thumb]:scale-100"
              />
              {/* Highlight track progress */}
              <div
                style={{ width: `${progressPercent}%` }}
                className="absolute left-0 top-1.5 h-1 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full pointer-events-none shadow-[0_0_8px_rgba(34,211,238,0.5)]"
              />
            </div>

            <span className="text-[11px] font-mono text-purple-300/70 w-9">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Right: Volume & Queue */}
        <div className="flex items-center justify-end gap-3 w-1/4 min-w-[180px]">
          {/* Volume */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="text-purple-300/70 hover:text-cyan-300 transition-colors p-1"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : volume < 0.5 ? (
                <Volume1 className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20 sm:w-24 h-1 bg-purple-950/80 rounded-full appearance-none cursor-pointer focus:outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(34,211,238,0.8)]"
            />
          </div>

          {/* Mini Player Toggle */}
          <button
            onClick={() => setShowMiniPlayer(!showMiniPlayer)}
            title={showMiniPlayer ? 'Ẩn màn hình video' : 'Hiện màn hình video (YouTube)'}
            className={`p-2 rounded-xl border transition-all ${
              showMiniPlayer
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-[0_0_12px_rgba(34,211,238,0.3)]'
                : 'text-purple-300/70 hover:text-white border-transparent hover:bg-purple-900/20'
            }`}
          >
            <Tv className="w-4 h-4" />
          </button>

          {/* Queue Drawer Toggle */}
          <div className="relative">
            <button
              onClick={() => setIsQueueOpen(!isQueueOpen)}
              title="Danh sách phát (Queue)"
              className={`p-2 rounded-xl border transition-all ${
                isQueueOpen
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-[0_0_12px_rgba(34,211,238,0.3)]'
                  : 'text-purple-300/70 hover:text-white border-transparent hover:bg-purple-900/20'
              }`}
            >
              <ListMusic className="w-4 h-4" />
            </button>

            {/* Queue Floating Popover */}
            {isQueueOpen && (
              <div className="absolute right-0 bottom-12 w-80 max-h-96 rounded-2xl bg-[#100e26]/95 backdrop-blur-2xl border border-purple-500/30 p-4 shadow-[0_0_30px_rgba(0,0,0,0.8)] flex flex-col gap-3 z-50">
                <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
                  <h4 className="text-xs font-bold text-white tracking-wider uppercase">
                    Queue ({playlist.length})
                  </h4>
                  <span className="text-[10px] text-cyan-400 font-mono">Playing</span>
                </div>
                <div className="flex flex-col gap-1.5 overflow-y-auto max-h-72 pr-1">
                  {playlist.map((t, idx) => {
                    const isItemPlaying = t.id === currentTrack.id;
                    return (
                      <div
                        key={`${t.id}-${idx}`}
                        onClick={() => playTrack(t)}
                        className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer text-xs transition-all ${
                          isItemPlaying
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                            : 'text-purple-200/80 hover:bg-purple-900/30 hover:text-white'
                        }`}
                      >
                        <span className="font-mono text-[10px] text-purple-400/60 w-4">
                          {idx + 1}
                        </span>
                        <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-purple-950">
                          {t.thumbnail_url && (
                            <img
                              src={t.thumbnail_url}
                              alt={t.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{t.title}</p>
                          <p className="text-[10px] text-purple-300/60 truncate">
                            {t.artist}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </footer>
    </>
  );
}
