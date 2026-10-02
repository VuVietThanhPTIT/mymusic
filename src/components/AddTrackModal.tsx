'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Sparkles, Music, CheckCircle2, AlertCircle, Play, Loader2 } from 'lucide-react';
import { useAdminStore } from '@/store/useAdminStore';
import { usePlayerStore } from '@/store/usePlayerStore';
import { Track } from '@/types/track';
import { fetchYouTubeMetadataFromBrowser, extractYouTubeId } from '@/lib/youtubeResolver';

function YoutubeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

const GENRE_OPTIONS = ['Lo-Fi', 'Chill', 'Piano', 'Synth', 'Folk', 'Workout', 'Ambient'];

interface AddTrackModalProps {
  onTrackAdded: (track: Track, andPlay?: boolean) => void;
}

export default function AddTrackModal({ onTrackAdded }: AddTrackModalProps) {
  const { isAddTrackModalOpen, setAddTrackModalOpen } = useAdminStore();
  const { playTrack } = usePlayerStore();

  const [url, setUrl] = useState('');
  const [genre, setGenre] = useState('Lo-Fi');
  const [customGenre, setCustomGenre] = useState('');

  // Auto-extracted states
  const [isFetchingInfo, setIsFetchingInfo] = useState(false);
  const [extractedInfo, setExtractedInfo] = useState<{
    title: string;
    artist: string;
    thumbnail_url: string;
  } | null>(null);

  // Manual override states
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [showManualEdit, setShowManualEdit] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Automatically fetch track title and info as soon as user types or pastes URL
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    const trimmed = url.trim();
    if (!trimmed || (!trimmed.includes('youtube.com') && !trimmed.includes('youtu.be'))) {
      setExtractedInfo(null);
      setIsFetchingInfo(false);
      return;
    }

    setIsFetchingInfo(true);
    debounceTimer.current = setTimeout(async () => {
      try {
        const info = await fetchYouTubeMetadataFromBrowser(trimmed);
        setExtractedInfo(info);
        if (!title) setTitle(info.title);
        if (!artist) setArtist(info.artist);
      } catch (err) {
        console.warn('Failed to auto-fetch:', err);
      } finally {
        setIsFetchingInfo(false);
      }
    }, 400);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [url]);

  if (!isAddTrackModalOpen) return null;

  const handleAddTrack = async (andPlay: boolean = false) => {
    setErrorMsg('');
    setSuccessMsg('');
    setSubmitting(true);

    const effectiveTitle = title.trim() || extractedInfo?.title || 'New Audio Track';
    const effectiveArtist = artist.trim() || extractedInfo?.artist || 'YouTube Music';
    const effectiveThumb = extractedInfo?.thumbnail_url || (extractYouTubeId(url) ? `https://img.youtube.com/vi/${extractYouTubeId(url)}/hqdefault.jpg` : '');
    const selectedGenre = customGenre.trim() || genre;

    try {
      const res = await fetch('/api/tracks/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          title: effectiveTitle,
          artist: effectiveArtist,
          thumbnail_url: effectiveThumb,
          genre: selectedGenre,
        }),
      });

      const data = await res.json();
      setSubmitting(false);

      if (res.ok && data.success && data.track) {
        setSuccessMsg(andPlay ? 'Đã thêm & bắt đầu phát nhạc!' : 'Đã thêm bài hát thành công!');
        onTrackAdded(data.track, andPlay);
        if (andPlay) {
          playTrack(data.track);
        }
        setTimeout(() => {
          setUrl('');
          setTitle('');
          setArtist('');
          setExtractedInfo(null);
          setSuccessMsg('');
          setAddTrackModalOpen(false);
        }, 900);
      } else {
        setErrorMsg(data.error || 'Không thể thêm bài hát. Vui lòng kiểm tra lại link!');
      }
    } catch {
      setSubmitting(false);
      setErrorMsg('Lỗi kết nối máy chủ');
    }
  };

  const isYouTube = url.includes('youtube.com') || url.includes('youtu.be') || url.includes('music.youtube.com');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg p-6 rounded-3xl bg-[#110f27]/95 border border-purple-500/30 shadow-[0_0_50px_rgba(168,85,247,0.35)]">
        {/* Close Button */}
        <button
          onClick={() => {
            setErrorMsg('');
            setSuccessMsg('');
            setAddTrackModalOpen(false);
          }}
          className="absolute top-5 right-5 p-1.5 rounded-full text-purple-400 hover:text-white hover:bg-purple-900/30 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-purple-600/30 border border-cyan-400/40 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.3)]">
            <Plus className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
              <span>Thêm Nhạc YouTube Music</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 font-mono">
                Auto-Pull
              </span>
            </h3>
            <p className="text-xs text-purple-300/70">
              Dán link YouTube Music hoặc YouTube bất kỳ — hệ thống tự động kéo tên bài về ngay lập tức!
            </p>
          </div>
        </div>

        {/* URL Input */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-purple-200/90 mb-1.5">
              Đường Dẫn YouTube Music (URL) <span className="text-pink-400">*</span>
            </label>
            <div className="relative">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Dán link (ví dụ: https://music.youtube.com/watch?v=...)"
                autoFocus
                className="w-full pl-4 pr-11 py-2.5 rounded-xl bg-[#0b091c] border border-purple-500/30 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 text-white placeholder-purple-300/40 text-sm transition-all"
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center">
                {isFetchingInfo ? (
                  <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                ) : isYouTube ? (
                  <YoutubeIcon className="w-4 h-4 text-red-500" />
                ) : null}
              </div>
            </div>
          </div>

          {/* AUTO-FETCHED POPUP / PREVIEW CARD (HIỂN THỊ NỔI BẬT LÊN) */}
          {isFetchingInfo && (
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-cyan-950/20 border border-cyan-400/30 text-cyan-300 text-xs animate-pulse">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
              <span>Đang tự động kéo tên bài hát & thông tin từ YouTube về...</span>
            </div>
          )}

          {extractedInfo && !isFetchingInfo && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/40 to-indigo-950/40 border border-cyan-400/50 shadow-[0_0_20px_rgba(34,211,238,0.2)] animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3">
                {/* Visual badge / thumbnail preview */}
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-purple-900/60 flex items-center justify-center flex-shrink-0 border border-cyan-400/40">
                  {extractedInfo.thumbnail_url ? (
                    <img
                      src={extractedInfo.thumbnail_url}
                      alt={extractedInfo.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Music className="w-5 h-5 text-cyan-300" />
                  )}
                </div>

                {/* Track info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 font-mono">
                      Đã tự động lấy tên bài hát:
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white truncate drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]">
                    {title || extractedInfo.title}
                  </h4>
                  <p className="text-xs text-purple-300/80 truncate">
                    {artist || extractedInfo.artist}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Genre Selection */}
          <div>
            <label className="block text-xs font-semibold text-purple-200/90 mb-1.5">
              Thể Loại (Genre)
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {GENRE_OPTIONS.map((g) => (
                <button
                  type="button"
                  key={g}
                  onClick={() => {
                    setGenre(g);
                    setCustomGenre('');
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-medium border transition-all ${
                    genre === g && !customGenre
                      ? 'bg-cyan-500/25 text-cyan-300 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                      : 'bg-[#0b091c] text-purple-200/70 border-purple-500/20 hover:border-purple-400/40'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={customGenre}
              onChange={(e) => setCustomGenre(e.target.value)}
              placeholder="Hoặc gõ thể loại khác tuỳ ý..."
              className="w-full px-3 py-1.5 rounded-xl bg-[#0b091c] border border-purple-500/30 focus:border-cyan-400 focus:outline-none text-xs text-white placeholder-purple-300/40"
            />
          </div>

          {/* Optional manual edit toggle */}
          <div>
            <button
              type="button"
              onClick={() => setShowManualEdit(!showManualEdit)}
              className="text-xs text-purple-400 hover:text-cyan-300 transition-colors underline decoration-dotted"
            >
              {showManualEdit ? '− Ẩn sửa tên thủ công' : '✎ Chỉnh sửa tên bài / ca sĩ nếu muốn'}
            </button>
          </div>

          {showManualEdit && (
            <div className="space-y-2 p-3 rounded-2xl bg-[#090818] border border-purple-500/20 animate-in fade-in duration-150">
              <div>
                <label className="block text-[11px] font-medium text-purple-300/80 mb-1">
                  Tên bài hát
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Tên bài hát..."
                  className="w-full px-3 py-1.5 rounded-lg bg-[#121029] border border-purple-500/30 text-xs text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-purple-300/80 mb-1">
                  Nghệ sĩ / Kênh
                </label>
                <input
                  type="text"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  placeholder="Kênh / Tên nghệ sĩ..."
                  className="w-full px-3 py-1.5 rounded-lg bg-[#121029] border border-purple-500/30 text-xs text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Feedback messages */}
          {errorMsg && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Action Buttons: Add Track / Add & Play */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() => handleAddTrack(false)}
              disabled={submitting || !url.trim()}
              className="py-3 rounded-xl font-semibold text-xs bg-purple-900/40 hover:bg-purple-800/50 border border-purple-400/40 text-purple-200 hover:text-white transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Thêm Vào Danh Sách</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleAddTrack(true)}
              disabled={submitting || !url.trim()}
              className="py-3 rounded-xl font-semibold text-xs bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all transform hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Thêm & Phát Ngay</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
