'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { extractYouTubeId } from '@/lib/youtubeResolver';
import { Tv, AlertCircle } from 'lucide-react';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YouTubeAudioEngineProps {
  showMiniPlayer: boolean;
  onToggleMiniPlayer: () => void;
}

export default function YouTubeAudioEngine({
  showMiniPlayer,
  onToggleMiniPlayer,
}: YouTubeAudioEngineProps) {
  const {
    currentTrack,
    isPlaying,
    volume,
    isMuted,
    nextTrack,
    setProgress,
    setDuration,
    setIsPlaying,
  } = usePlayerStore();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [apiReady, setApiReady] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isMp3 = currentTrack?.source_url?.endsWith('.mp3');
  const ytVideoId = currentTrack ? extractYouTubeId(currentTrack.source_url) : null;

  // 1. Load YouTube Iframe API Script once
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.YT && window.YT.Player) {
      setApiReady(true);
      return;
    }

    // Check if script tag already exists
    const existingScript = document.getElementById('yt-iframe-api');
    if (!existingScript) {
      const tag = document.createElement('script');
      tag.id = 'yt-iframe-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
    }

    const prevReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (prevReady) prevReady();
      setApiReady(true);
    };
  }, []);

  // 2. Initialize YouTube Player
  const initPlayer = useCallback(
    (videoId: string) => {
      if (!window.YT || !window.YT.Player) return;

      // Destroy previous instance
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {}
        playerRef.current = null;
      }

      setIsPlayerReady(false);
      setErrorMessage(null);

      // Create new player attached to #youtube-player-element
      playerRef.current = new window.YT.Player('youtube-player-element', {
        videoId: videoId,
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: 1,
          controls: 1,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: (event: any) => {
            playerRef.current = event.target;
            setIsPlayerReady(true);
            const target = event.target;
            if (typeof target.setVolume === 'function') {
              target.setVolume(isMuted ? 0 : Math.round(volume * 100));
            }

            if (typeof target.getDuration === 'function') {
              const dur = target.getDuration();
              if (dur && dur > 0) setDuration(dur);
            }

            if (isPlaying && typeof target.playVideo === 'function') {
              try {
                target.playVideo();
              } catch (e) {
                console.warn('Auto-play blocked by browser policy:', e);
              }
            }
          },
          onStateChange: (event: any) => {
            playerRef.current = event.target;
            // YT.PlayerState: -1: UNSTARTED, 0: ENDED, 1: PLAYING, 2: PAUSED, 3: BUFFERING, 5: CUED
            if (event.data === 1) {
              setIsPlaying(true);
              setErrorMessage(null);
            } else if (event.data === 2) {
              setIsPlaying(false);
            } else if (event.data === 0) {
              nextTrack();
            }
          },
          onError: (event: any) => {
            console.warn('YouTube Player error code:', event.data);
            if (event.data === 101 || event.data === 150) {
              setErrorMessage('Chủ sở hữu video không cho phép phát ngoài YouTube. Đang chuyển bài tiếp theo...');
            } else {
              setErrorMessage('Lỗi phát âm thanh từ YouTube. Đang chuyển bài tiếp theo...');
            }
            setTimeout(() => nextTrack(), 3000);
          },
        },
      });
    },
    [isMuted, volume, isPlaying, setDuration, setIsPlaying, nextTrack]
  );

  // 3. When track or API ready changes, re-init player
  useEffect(() => {
    if (isMp3) {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {}
        playerRef.current = null;
      }
      return;
    }

    if (apiReady && ytVideoId) {
      initPlayer(ytVideoId);
    }
  }, [apiReady, ytVideoId, isMp3, initPlayer]);

  // 4. Sync Play / Pause state
  useEffect(() => {
    if (isMp3 && audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch((e) => console.warn('Audio play error:', e));
      } else {
        audioRef.current.pause();
      }
      return;
    }

    if (playerRef.current && isPlayerReady && typeof playerRef.current.playVideo === 'function') {
      try {
        const state = typeof playerRef.current.getPlayerState === 'function' ? playerRef.current.getPlayerState() : -1;
        if (isPlaying && state !== 1) {
          playerRef.current.playVideo();
        } else if (!isPlaying && state === 1 && typeof playerRef.current.pauseVideo === 'function') {
          playerRef.current.pauseVideo();
        }
      } catch (err) {
        console.warn('Play/Pause sync error:', err);
      }
    }
  }, [isPlaying, isPlayerReady, isMp3]);

  // 5. Sync Volume
  useEffect(() => {
    if (isMp3 && audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
      return;
    }

    if (playerRef.current && isPlayerReady) {
      try {
        if (isMuted && typeof playerRef.current.mute === 'function') {
          playerRef.current.mute();
        } else if (typeof playerRef.current.unMute === 'function') {
          playerRef.current.unMute();
          if (typeof playerRef.current.setVolume === 'function') {
            playerRef.current.setVolume(Math.round(volume * 100));
          }
        }
      } catch (err) {
        console.warn('Volume sync error:', err);
      }
    }
  }, [volume, isMuted, isPlayerReady, isMp3]);

  // 6. Polling ticker for currentTime progress
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      if (isMp3 && audioRef.current) {
        setProgress(audioRef.current.currentTime);
        if (audioRef.current.duration) {
          setDuration(audioRef.current.duration);
        }
        return;
      }

      if (playerRef.current && isPlayerReady && typeof playerRef.current.getCurrentTime === 'function') {
        try {
          const curr = playerRef.current.getCurrentTime();
          const dur = typeof playerRef.current.getDuration === 'function' ? playerRef.current.getDuration() : 0;
          if (curr !== undefined && !isNaN(curr)) {
            setProgress(curr);
          }
          if (dur && dur > 0) {
            setDuration(dur);
          }
        } catch {}
      }
    }, 500);

    return () => clearInterval(timer);
  }, [isPlaying, isPlayerReady, isMp3, setProgress, setDuration]);

  // 7. Custom seek listener from BottomPlayer
  useEffect(() => {
    const handleCustomSeek = (e: any) => {
      const targetSec = e.detail;
      if (typeof targetSec !== 'number') return;

      if (isMp3 && audioRef.current) {
        audioRef.current.currentTime = targetSec;
      } else if (playerRef.current && isPlayerReady) {
        try {
          playerRef.current.seekTo(targetSec, true);
        } catch {}
      }
    };

    window.addEventListener('player_seek', handleCustomSeek);
    return () => window.removeEventListener('player_seek', handleCustomSeek);
  }, [isMp3, isPlayerReady]);

  if (!currentTrack) return null;

  return (
    <>
      {/* Direct MP3 Audio Tag Fallback */}
      {isMp3 && (
        <audio
          ref={audioRef}
          src={currentTrack.source_url}
          onEnded={nextTrack}
          onTimeUpdate={() => {
            if (audioRef.current) {
              setProgress(audioRef.current.currentTime);
            }
          }}
          onLoadedMetadata={() => {
            if (audioRef.current) {
              setDuration(audioRef.current.duration);
            }
          }}
          className="hidden"
        />
      )}

      {/* Floating Video Player Frame (Required for YouTube Web Audio Decode) */}
      {!isMp3 && (
        <div
          ref={containerRef}
          className={`fixed bottom-28 right-6 z-40 rounded-2xl overflow-hidden shadow-[0_0_35px_rgba(0,0,0,0.9)] border border-cyan-400/50 bg-black transition-all duration-300 ${
            showMiniPlayer
              ? 'w-80 h-48 opacity-100 pointer-events-auto scale-100'
              : 'w-24 h-14 opacity-25 hover:opacity-100 pointer-events-auto scale-90'
          }`}
        >
          {/* Header Bar */}
          <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-black/90 to-transparent z-10 px-3 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0 pr-2">
              <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-cyan-400 animate-pulse' : 'bg-purple-400'}`} />
              <span className="text-[11px] font-mono text-cyan-300 font-bold uppercase tracking-wider truncate">
                {currentTrack.title}
              </span>
            </div>
            <button
              onClick={onToggleMiniPlayer}
              title={showMiniPlayer ? 'Thu nhỏ video' : 'Mở rộng video'}
              className="text-xs text-purple-200 hover:text-white bg-white/10 hover:bg-white/20 rounded px-1.5 py-0.5 transition-colors"
            >
              {showMiniPlayer ? '−' : '□'}
            </button>
          </div>

          {/* YouTube Player Element Container */}
          <div className="w-full h-full pt-2 bg-black flex items-center justify-center">
            <div id="youtube-player-element" className="w-full h-full" />
          </div>
        </div>
      )}

      {/* Playback Error Alert Toast */}
      {errorMessage && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-red-950/95 border border-red-500/70 text-red-200 text-xs shadow-[0_0_25px_rgba(239,68,68,0.5)] flex items-center gap-2 animate-bounce">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </>
  );
}
