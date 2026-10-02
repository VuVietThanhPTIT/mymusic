'use client';

import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  alpha: number;
  twinkleSpeed: number;
  phase: number;
  vx: number;
  vy: number;
}

interface Meteor {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  alpha: number;
  active: boolean;
}

export default function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initStars();
    };

    window.addEventListener('resize', handleResize);

    // Create stars
    const starCount = 180;
    let stars: Star[] = [];

    const initStars = () => {
      stars = [];
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 1.8 + 0.5,
          baseAlpha: Math.random() * 0.7 + 0.3,
          alpha: Math.random() * 0.7 + 0.3,
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          phase: Math.random() * Math.PI * 2,
          vx: (Math.random() - 0.5) * 0.1,
          vy: (Math.random() - 0.5) * 0.1,
        });
      }
    };

    initStars();

    // Meteors (shooting stars)
    let meteors: Meteor[] = [];

    const spawnMeteor = () => {
      if (meteors.length >= 2) return;
      meteors.push({
        x: Math.random() * width * 0.8 + width * 0.1,
        y: Math.random() * height * 0.4,
        length: Math.random() * 80 + 60,
        speed: Math.random() * 8 + 6,
        angle: (Math.PI / 4) + (Math.random() - 0.5) * 0.2, // ~45 degrees
        alpha: 1,
        active: true,
      });
    };

    let meteorTimer = setInterval(() => {
      if (Math.random() > 0.4) {
        spawnMeteor();
      }
    }, 3500);

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render cosmic background gradients
      const bgGrad = ctx.createRadialGradient(
        width * 0.8,
        height * 0.2,
        50,
        width * 0.8,
        height * 0.2,
        width * 0.6
      );
      bgGrad.addColorStop(0, 'rgba(126, 34, 206, 0.12)'); // Deep Purple
      bgGrad.addColorStop(1, 'rgba(9, 9, 11, 0)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      const bgGrad2 = ctx.createRadialGradient(
        width * 0.2,
        height * 0.7,
        50,
        width * 0.2,
        height * 0.7,
        width * 0.5
      );
      bgGrad2.addColorStop(0, 'rgba(6, 182, 212, 0.08)'); // Cyan
      bgGrad2.addColorStop(1, 'rgba(9, 9, 11, 0)');
      ctx.fillStyle = bgGrad2;
      ctx.fillRect(0, 0, width, height);

      // Render stars
      for (const s of stars) {
        s.phase += s.twinkleSpeed;
        s.alpha = s.baseAlpha + Math.sin(s.phase) * 0.3;
        s.alpha = Math.max(0.1, Math.min(1, s.alpha));

        // Subtle drift
        s.x += s.vx;
        s.y += s.vy;
        if (s.x < 0) s.x = width;
        if (s.x > width) s.x = 0;
        if (s.y < 0) s.y = height;
        if (s.y > height) s.y = 0;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        // Alternate star colors between cyan, violet, and crisp white
        if (s.size > 1.8) {
          ctx.fillStyle = `rgba(168, 85, 247, ${s.alpha})`; // Purple
          ctx.shadowColor = '#c084fc';
          ctx.shadowBlur = 6;
        } else if (s.size > 1.4) {
          ctx.fillStyle = `rgba(34, 211, 238, ${s.alpha})`; // Cyan
          ctx.shadowColor = '#22d3ee';
          ctx.shadowBlur = 4;
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
          ctx.shadowBlur = 0;
        }
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // Render shooting stars
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        if (!m.active) continue;

        const tailX = m.x - Math.cos(m.angle) * m.length;
        const tailY = m.y - Math.sin(m.angle) * m.length;

        const grad = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        grad.addColorStop(0.7, 'rgba(34, 211, 238, 0.4)');
        grad.addColorStop(1, `rgba(255, 255, 255, ${m.alpha})`);

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(m.x, m.y);
        ctx.stroke();

        // Advance meteor
        m.x += Math.cos(m.angle) * m.speed;
        m.y += Math.sin(m.angle) * m.speed;
        m.alpha -= 0.015;

        if (m.alpha <= 0 || m.x > width || m.y > height) {
          meteors.splice(i, 1);
        }
      }

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
      clearInterval(meteorTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none -z-10 bg-[#09090b]"
      aria-hidden="true"
    />
  );
}
