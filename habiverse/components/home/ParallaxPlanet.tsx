"use client";

import { useEffect, useRef, useState } from "react";

export function ParallaxPlanet() {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const raf = useRef<number | null>(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const w = window.innerWidth, h = window.innerHeight;
      target.current = {
        x: (e.clientX / w - 0.5) * 20,
        y: (e.clientY / h - 0.5) * -14,
      };
    };
    window.addEventListener("mousemove", onMove);

    const tick = () => {
      const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
      current.current.x = lerp(current.current.x, target.current.x, 0.06);
      current.current.y = lerp(current.current.y, target.current.y, 0.06);
      setTilt({ x: current.current.x, y: current.current.y });
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  const orbits = [
    { size: 310, dur: 24, col: "rgba(99,102,241,0.09)",  layer: 0.4 },
    { size: 235, dur: 16, col: "rgba(139,92,246,0.13)",  layer: 0.6 },
    { size: 165, dur: 10, col: "rgba(56,189,248,0.11)",  layer: 0.8 },
  ];

  return (
    <div
      ref={ref}
      style={{
        position: "relative", width: 340, height: 340,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
        transform: `perspective(900px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
        transition: "transform 0.05s linear",
        transformStyle: "preserve-3d",
      }}
    >
      {/* Orbit rings — each translates by a different parallax amount */}
      {orbits.map((o, i) => (
        <div key={i} style={{
          position: "absolute",
          width: o.size, height: o.size,
          top: "50%", left: "50%",
          marginTop: -o.size / 2, marginLeft: -o.size / 2,
          borderRadius: "50%",
          border: `1px solid ${o.col}`,
          animation: `orbit-cw ${o.dur}s linear infinite`,
          transform: `translateX(${tilt.x * o.layer * -0.6}px) translateY(${tilt.y * o.layer * -0.6}px)`,
        }} />
      ))}

      {/* Orbiting dot on outer ring */}
      <div style={{
        position: "absolute",
        width: 310, height: 310,
        top: "50%", left: "50%",
        marginTop: -155, marginLeft: -155,
        animation: "orbit-cw 24s linear infinite",
        transform: `translateX(${tilt.x * -0.25}px) translateY(${tilt.y * -0.25}px)`,
      }}>
        <div style={{
          position: "absolute", top: "50%", left: -5, marginTop: -5,
          width: 10, height: 10, borderRadius: "50%",
          background: "#38bdf8",
          boxShadow: "0 0 16px #38bdf8, 0 0 32px #38bdf860",
        }} />
      </div>

      {/* Second dot on inner ring */}
      <div style={{
        position: "absolute",
        width: 165, height: 165,
        top: "50%", left: "50%",
        marginTop: -82, marginLeft: -82,
        animation: "orbit-ccw 10s linear infinite",
        transform: `translateX(${tilt.x * -0.4}px) translateY(${tilt.y * -0.4}px)`,
      }}>
        <div style={{
          position: "absolute", bottom: -4, right: -4,
          width: 7, height: 7, borderRadius: "50%",
          background: "#a78bfa",
          boxShadow: "0 0 10px #a78bfa",
        }} />
      </div>

      {/* Bloom */}
      <div style={{
        position: "absolute",
        width: 220, height: 220,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)",
        transform: `translateX(${tilt.x * -0.5}px) translateY(${tilt.y * -0.5}px)`,
      }} />

      {/* Planet body */}
      <div style={{
        position: "relative", width: 114, height: 114, borderRadius: "50%",
        background: "radial-gradient(circle at 36% 32%, #818cf8 0%, #4f46e5 50%, #1e1b4b 100%)",
        boxShadow: `
          0 0 60px rgba(99,102,241,0.55),
          0 0 120px rgba(99,102,241,0.18),
          inset 0 0 28px rgba(255,255,255,0.05),
          inset -14px -10px 24px rgba(0,0,0,0.4)
        `,
        animation: "float 7s ease-in-out infinite",
        zIndex: 2,
        transform: `translateX(${tilt.x * -0.8}px) translateY(${tilt.y * -0.8}px)`,
      }}>
        <div style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          background: "radial-gradient(ellipse at 32% 28%, rgba(255,255,255,0.15) 0%, transparent 52%)",
        }} />
      </div>

      {/* Floating data cards — each layer at different depth */}
      {[
        {
          label: "Radius", val: "1.06 R⊕", col: "rgba(99,102,241,0.3)",
          style: { top: "8%", right: "-8%", animDelay: "1.2s" },
          layer: 1.1,
        },
        {
          label: "Habitability", val: "69 / 100", col: "rgba(34,197,94,0.3)",
          style: { bottom: "12%", left: "-6%", animDelay: "2.8s" },
          layer: 0.9,
        },
        {
          label: "Temp", val: "288 K", col: "rgba(56,189,248,0.25)",
          style: { top: "54%", right: "-14%", animDelay: "0.5s" },
          layer: 1.3,
        },
      ].map((card, i) => (
        <div key={i} style={{
          position: "absolute", ...card.style,
          animation: `float ${6 + i}s ease-in-out infinite`,
          animationDelay: card.style.animDelay,
          transform: `translateX(${tilt.x * card.layer * -0.4}px) translateY(${tilt.y * card.layer * -0.4}px)`,
          zIndex: 3,
        }}>
          <div style={{
            padding: "8px 12px", borderRadius: 10,
            background: "rgba(10,14,38,0.92)",
            border: `1px solid ${card.col}`,
            boxShadow: "0 4px 20px rgba(0,0,0,0.35)",
            backdropFilter: "blur(12px)",
          }}>
            <div style={{ fontSize: 10, color: "rgba(165,180,252,0.5)", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {card.label}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#a5b4fc" }}>{card.val}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
