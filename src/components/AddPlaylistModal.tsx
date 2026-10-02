'use client';

import React, { useState } from 'react';
import { X, ListPlus, Sparkles } from 'lucide-react';
import { useAdminStore } from '@/store/useAdminStore';

export default function AddPlaylistModal() {
  const { isAddPlaylistModalOpen, setAddPlaylistModalOpen, addPlaylist } =
    useAdminStore();
  const [name, setName] = useState('');

  if (!isAddPlaylistModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      addPlaylist(name.trim());
      setName('');
      setAddPlaylistModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm p-6 rounded-3xl bg-[#121029]/95 border border-purple-500/30 shadow-[0_0_50px_rgba(168,85,247,0.3)]">
        <button
          onClick={() => setAddPlaylistModalOpen(false)}
          className="absolute top-5 right-5 p-1.5 rounded-full text-purple-400 hover:text-white hover:bg-purple-900/30 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-purple-500/20 to-pink-500/20 border border-purple-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            <ListPlus className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-wide">
              Tạo Playlist Mới
            </h3>
            <p className="text-xs text-purple-300/70 mt-0.5">
              Nhập tên danh sách bài hát yêu thích của bạn
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ví dụ: Night Driving, Coding Flow..."
            autoFocus
            required
            className="w-full px-4 py-2.5 rounded-xl bg-[#0c0a1c] border border-purple-500/30 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 text-white placeholder-purple-300/40 text-sm"
          />

          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full py-2.5 rounded-xl font-semibold text-xs bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all transform hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50"
          >
            Tạo Danh Sách
          </button>
        </form>
      </div>
    </div>
  );
}
