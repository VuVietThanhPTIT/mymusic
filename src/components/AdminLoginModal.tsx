'use client';

import React, { useState } from 'react';
import { Lock, X, Eye, EyeOff, ShieldAlert, Sparkles } from 'lucide-react';
import { useAdminStore } from '@/store/useAdminStore';

export default function AdminLoginModal() {
  const { isLoginModalOpen, setLoginModalOpen, login, setAddTrackModalOpen } =
    useAdminStore();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isLoginModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const res = await login(password);
    setLoading(false);

    if (res.success) {
      setPassword('');
      setLoginModalOpen(false);
    } else {
      setErrorMsg(res.error || 'Mật khẩu không đúng. Vui lòng kiểm tra lại!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md p-6 rounded-3xl bg-[#121029]/95 border border-purple-500/30 shadow-[0_0_50px_rgba(168,85,247,0.3)]">
        {/* Close Button */}
        <button
          onClick={() => {
            setErrorMsg('');
            setLoginModalOpen(false);
          }}
          className="absolute top-5 right-5 p-1.5 rounded-full text-purple-400 hover:text-white hover:bg-purple-900/30 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col items-center text-center gap-3 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-purple-500/20 to-pink-500/20 border border-purple-500/40 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)]">
            <Lock className="w-7 h-7 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-wide">
              Admin Mode Unlock
            </h3>
            <p className="text-xs text-purple-300/70 mt-1 max-w-xs">
              Nhập Master Password để mở quyền thêm bài hát mới và quản trị website.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập Master Password (mặc định: admin)"
              autoFocus
              required
              className="w-full pl-4 pr-11 py-3 rounded-xl bg-[#0c0a1c] border border-purple-500/30 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 text-white placeholder-purple-300/40 text-sm transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-purple-400 hover:text-white transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs animate-shake">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-purple-400/60 px-1">
            <span>Thiết lập qua biến ADMIN_PASSWORD</span>
            <span className="font-mono text-cyan-400/80">.env.local</span>
          </div>

          <button
            type="submit"
            disabled={loading || !password.trim()}
            className="w-full mt-2 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all transform hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Xác nhận & Mở khoá</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
