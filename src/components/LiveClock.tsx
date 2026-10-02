'use client';

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function LiveClock() {
  const [mounted, setMounted] = useState(false);
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
      setDateStr(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })
      );
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!mounted) {
    return (
      <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-950/20 border border-purple-500/20 text-purple-300/40 text-xs font-mono">
        <Clock className="w-3.5 h-3.5 text-purple-400/40" />
        <span>--:--:-- --</span>
      </div>
    );
  }

  return (
    <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-purple-950/30 backdrop-blur-md border border-purple-500/30 text-purple-200 text-xs font-mono shadow-[0_0_12px_rgba(168,85,247,0.2)]">
      <Clock className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
      <span className="font-semibold text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
        {timeStr}
      </span>
      <span className="text-purple-400/60">•</span>
      <span className="text-purple-300/80">{dateStr}</span>
    </div>
  );
}
