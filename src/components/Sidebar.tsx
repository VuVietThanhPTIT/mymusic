'use client';

import React from 'react';
import {
  LayoutGrid,
  Heart,
  Headphones,
  Sparkles,
  ListMusic,
  Plus,
  Lock,
  Unlock,
  Radio,
  Music2,
  Activity,
} from 'lucide-react';
import { useAdminStore } from '@/store/useAdminStore';
import { usePlayerStore } from '@/store/usePlayerStore';

export default function Sidebar() {
  const {
    isAdmin,
    activeCategory,
    setActiveCategory,
    setLoginModalOpen,
    setAddPlaylistModalOpen,
    logout,
    playlists,
  } = useAdminStore();

  const { favorites } = usePlayerStore();

  const navItems = [
    { id: 'all', label: 'All Tracks', icon: LayoutGrid },
    { id: 'favorites', label: 'Favorites', icon: Heart, count: favorites.length },
    { id: 'study', label: 'Study Beats', icon: Headphones },
    { id: 'new', label: 'New Releases', icon: Sparkles },
  ];

  return (
    <aside className="w-64 h-screen sticky top-0 flex-shrink-0 flex flex-col justify-between p-4 bg-[#0d0c1d]/70 backdrop-blur-xl border-r border-purple-500/20 text-white z-20 select-none">
      {/* Top Section */}
      <div className="flex flex-col gap-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 px-2 pt-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.5)]">
            <Radio className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-wider bg-gradient-to-r from-cyan-400 via-purple-300 to-pink-400 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(34,211,238,0.4)]">
              MY MUSIC HUB
            </h1>
            <p className="text-[10px] tracking-widest text-purple-400/70 uppercase font-mono">
              Cyber Hub Edition
            </p>
          </div>
        </div>

        {/* Primary Navigation */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeCategory === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveCategory(item.id)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-purple-600/25 text-cyan-300 border border-cyan-400/40 shadow-[0_0_16px_rgba(34,211,238,0.25)]'
                    : 'text-purple-200/70 hover:text-white hover:bg-purple-900/20 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive
                        ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]'
                        : 'text-purple-400/60 group-hover:text-purple-300'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Playlists Section */}
        <div className="flex flex-col gap-2 pt-2 border-t border-purple-500/15">
          <div className="px-3 flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-purple-300/60 uppercase">
              Playlists
            </span>
          </div>

          <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pr-1">
            {playlists.map((playlist) => {
              const isActive = activeCategory === playlist;
              return (
                <button
                  key={playlist}
                  onClick={() => setActiveCategory(playlist)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'text-cyan-300 bg-cyan-950/30 border border-cyan-400/30'
                      : 'text-purple-200/60 hover:text-white hover:bg-purple-900/20'
                  }`}
                >
                  <ListMusic className="w-3.5 h-3.5 text-purple-400/70" />
                  <span className="truncate">{playlist}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setAddPlaylistModalOpen(true)}
            className="mt-2 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-[0_0_18px_rgba(6,182,212,0.35)] transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Playlist</span>
          </button>
        </div>
      </div>

      {/* Bottom Admin Bar */}
      <div className="pt-4 border-t border-purple-500/20">
        {isAdmin ? (
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-purple-950/40 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <Unlock className="w-4 h-4 text-cyan-400" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
              </div>
              <span className="text-xs font-medium text-cyan-300">Admin Mode</span>
            </div>
            <button
              onClick={() => logout()}
              className="text-[11px] text-purple-300 hover:text-red-400 underline decoration-dotted transition-colors"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={() => setLoginModalOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-purple-950/20 hover:bg-purple-900/30 border border-purple-500/20 hover:border-purple-400/40 text-purple-300/80 hover:text-white transition-all text-xs font-medium group"
          >
            <div className="flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-purple-400 group-hover:text-cyan-400 transition-colors" />
              <span>Admin Mode</span>
            </div>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-purple-900/40 text-purple-400">
              Lock
            </span>
          </button>
        )}
      </div>
    </aside>
  );
}
