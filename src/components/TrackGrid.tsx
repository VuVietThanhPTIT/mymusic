'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsRight, ChevronsLeft, Music } from 'lucide-react';
import { Track } from '@/types/track';
import TrackCard from './TrackCard';

interface TrackGridProps {
  tracks: Track[];
  isLoading?: boolean;
  onDeleteTrack?: (id: string) => void;
}

export default function TrackGrid({ tracks, isLoading, onDeleteTrack }: TrackGridProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const totalPages = Math.max(1, Math.ceil(tracks.length / itemsPerPage));
  const effectivePage = Math.min(currentPage, totalPages);

  const startIndex = (effectivePage - 1) * itemsPerPage;
  const currentTracks = tracks.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 py-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#121026]/40 border border-purple-500/10 animate-pulse"
          >
            <div className="w-16 h-16 rounded-xl bg-purple-900/30 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-purple-900/40 rounded w-3/4" />
              <div className="h-3 bg-purple-900/30 rounded w-1/2" />
              <div className="h-4 bg-purple-900/20 rounded-full w-14" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-center mb-4 text-purple-400">
          <Music className="w-8 h-8 opacity-60" />
        </div>
        <h3 className="text-lg font-semibold text-white">Không tìm thấy bài hát nào</h3>
        <p className="text-sm text-purple-300/60 max-w-sm mt-1">
          Hãy thử tìm kiếm với từ khoá khác hoặc nhấn "+ Add Track" để thêm bản nhạc yêu thích của bạn.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 4-column Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {currentTracks.map((track) => (
          <TrackCard
            key={track.id}
            track={track}
            playlist={tracks}
            onDelete={onDeleteTrack}
          />
        ))}
      </div>

      {/* Pagination Bar (Matching screenshot) */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6 pb-24 select-none">
          <span className="text-xs font-medium text-purple-300/70 mr-1">Page</span>

          {/* Page numbers */}
          {Array.from({ length: totalPages }).map((_, idx) => {
            const pageNum = idx + 1;
            // Only show close pages
            if (
              pageNum === 1 ||
              pageNum === totalPages ||
              (pageNum >= effectivePage - 1 && pageNum <= effectivePage + 1)
            ) {
              const isActive = effectivePage === pageNum;
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-8 h-8 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.6)] font-bold scale-105'
                      : 'bg-[#15122e]/80 text-purple-200/80 hover:bg-purple-900/40 hover:text-white border border-purple-500/20'
                  }`}
                >
                  {pageNum}
                </button>
              );
            }
            if (pageNum === effectivePage - 2 || pageNum === effectivePage + 2) {
              return (
                <span key={pageNum} className="text-purple-400/50 text-xs px-1">
                  ...
                </span>
              );
            }
            return null;
          })}

          <span className="text-xs font-medium text-purple-300/70 mx-1">
            of {totalPages}
          </span>

          {/* Next & Last button */}
          <button
            onClick={() => handlePageChange(effectivePage + 1)}
            disabled={effectivePage === totalPages}
            title="Next Page"
            className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#15122e]/80 text-purple-200/80 hover:bg-purple-900/40 hover:text-white border border-purple-500/20 disabled:opacity-30 disabled:pointer-events-none transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={effectivePage === totalPages}
            title="Last Page"
            className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#15122e]/80 text-purple-200/80 hover:bg-purple-900/40 hover:text-white border border-purple-500/20 disabled:opacity-30 disabled:pointer-events-none transition-all"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
