'use client';

import React from 'react';
import { Search, ArrowUpDown, Plus, User, ShieldCheck } from 'lucide-react';
import LiveClock from './LiveClock';
import { useAdminStore } from '@/store/useAdminStore';
import { SortOption } from '@/types/track';

interface HeaderProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export default function Header({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
}: HeaderProps) {
  const { isAdmin, triggerAddTrack, setLoginModalOpen } = useAdminStore();

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 select-none">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.2)]">
          Library
        </h2>
      </div>

      {/* Middle & Right Actions */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 sm:w-80 min-w-[220px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search your library..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#14122b]/80 border border-purple-500/30 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 text-white placeholder-purple-300/40 text-sm transition-all duration-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-purple-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Sort By Dropdown */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#14122b]/80 border border-purple-500/30 text-purple-200 text-xs">
          <ArrowUpDown className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-purple-400/80 font-medium">Sort By</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
          >
            <option value="alphabetical" className="bg-[#14122b] text-white">
              Alphabetical
            </option>
            <option value="latest" className="bg-[#14122b] text-white">
              Latest Added
            </option>
            <option value="artist" className="bg-[#14122b] text-white">
              Artist
            </option>
          </select>
        </div>

        {/* Live Clock Widget */}
        <LiveClock />

        {/* Add Track Button */}
        <button
          onClick={triggerAddTrack}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 hover:from-cyan-500/30 hover:to-purple-500/30 border border-cyan-400/50 hover:border-cyan-300 text-cyan-300 hover:text-white text-xs font-semibold shadow-[0_0_16px_rgba(34,211,238,0.25)] transition-all transform hover:scale-[1.03] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 text-cyan-400" />
          <span>+ Add Track</span>
        </button>

        {/* Admin Avatar Button */}
        <button
          onClick={() => (!isAdmin ? setLoginModalOpen(true) : null)}
          title={isAdmin ? 'Admin Mode Active' : 'Click to Login as Admin'}
          className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${
            isAdmin
              ? 'bg-purple-900/40 border-cyan-400/60 shadow-[0_0_12px_rgba(34,211,238,0.4)] text-cyan-300'
              : 'bg-purple-950/30 border-purple-500/20 text-purple-300/70 hover:text-white hover:border-purple-400/40'
          }`}
        >
          {isAdmin ? (
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          ) : (
            <User className="w-4 h-4" />
          )}
        </button>
      </div>
    </header>
  );
}
