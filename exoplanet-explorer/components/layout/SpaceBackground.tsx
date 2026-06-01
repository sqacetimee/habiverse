"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number; y: number;
  r: number;
  alpha: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  layer: 1 | 2 | 3; // 1 = far/dim, 2 = mid, 3 = close/bright
}

export function SpaceBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Three layers: distant dim dots, mid-field, and a few bright foreground stars
    const stars: Star[] = [
      // Layer 1 — distant, tiny, barely visible (200)
      ...Array.from({ length: 200 }, () => ({
        x: Math.random(), y: Math.random(),
        r: Math.random() * 0.6 + 0.2,
        alpha: Math.random() * 0.35 + 0.15,
        twinkleSpeed: Math.random() * 0.003 + 0.001,
        twinkleOffset: Math.random() * Math.PI * 2,
        layer: 1 as const,
      })),
      // Layer 2 — mid stars, clearly visible (220)
      ...Array.from({ length: 220 }, () => ({
        x: Math.random(), y: Math.random(),
        r: Math.random() * 1.0 + 0.5,
        alpha: Math.random() * 0.5 + 0.35,
        twinkleSpeed: Math.random() * 0.005 + 0.002,
        twinkleOffset: Math.random() * Math.PI * 2,
        layer: 2 as const,
      })),
      // Layer 3 — bright foreground stars with visible glow (60)
      ...Array.from({ length: 60 }, () => ({
        x: Math.random(), y: Math.random(),
        r: Math.random() * 1.6 + 1.0,
        alpha: Math.random() * 0.4 + 0.6,
        twinkleSpeed: Math.random() * 0.008 + 0.003,
        twinkleOffset: Math.random() * Math.PI * 2,
        layer: 3 as const,
      })),
    ];

    let t = 0;

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;

      // Deep space base
      const bg = ctx.createRadialGradient(W * 0.5, H * 0.3, 0, W * 0.5, H * 0.3, W);
      bg.addColorStop(0,   "#0d1340");
      bg.addColorStop(0.4, "#080c22");
      bg.addColorStop(1,   "#020510");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Nebula glow — upper left (blue-violet)
      const n1 = ctx.createRadialGradient(W * 0.1, H * 0.15, 0, W * 0.1, H * 0.15, W * 0.55);
      n1.addColorStop(0,   "rgba(99,102,241,0.1)");
      n1.addColorStop(0.4, "rgba(139,92,246,0.06)");
      n1.addColorStop(1,   "transparent");
      ctx.fillStyle = n1;
      ctx.fillRect(0, 0, W, H);

      // Nebula glow — lower right (cyan)
      const n2 = ctx.createRadialGradient(W * 0.9, H * 0.85, 0, W * 0.9, H * 0.85, W * 0.5);
      n2.addColorStop(0,   "rgba(34,211,238,0.08)");
      n2.addColorStop(0.5, "rgba(56,189,248,0.04)");
      n2.addColorStop(1,   "transparent");
      ctx.fillStyle = n2;
      ctx.fillRect(0, 0, W, H);

      // Nebula glow — centre (purple hint)
      const n3 = ctx.createRadialGradient(W * 0.6, H * 0.4, 0, W * 0.6, H * 0.4, W * 0.35);
      n3.addColorStop(0,   "rgba(167,139,250,0.05)");
      n3.addColorStop(1,   "transparent");
      ctx.fillStyle = n3;
      ctx.fillRect(0, 0, W, H);

      // Stars
      t++;
      for (const s of stars) {
        const tw = Math.sin(t * s.twinkleSpeed + s.twinkleOffset) * 0.28 + 0.72;
        const a  = s.alpha * tw;
        const sx = s.x * W;
        const sy = s.y * H;

        if (s.layer === 3) {
          // Bright star: outer glow + inner glow + point
          ctx.beginPath();
          ctx.arc(sx, sy, s.r * 4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(200,215,255,${a * 0.06})`;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(sx, sy, s.r * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(210,220,255,${a * 0.18})`;
          ctx.fill();
        } else if (s.layer === 2) {
          // Mid star: soft halo
          ctx.beginPath();
          ctx.arc(sx, sy, s.r * 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(200,210,255,${a * 0.1})`;
          ctx.fill();
        }

        // Star core
        ctx.beginPath();
        ctx.arc(sx, sy, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(230,235,255,${a})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed", inset: 0,
        width: "100%", height: "100%",
        pointerEvents: "none", zIndex: 0,
      }}
    />
  );
}
