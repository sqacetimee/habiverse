import type { Planet } from "@/lib/types";

function getPlanetPalette(planet: Planet): [string, string, string] {
  const t = planet.equilibriumTempK;
  if (t === null) return ["#818cf8", "#6366f1", "#4338ca"];
  if (t > 1500) return ["#fb923c", "#f97316", "#c2410c"];   // hot — lava orange
  if (t > 800)  return ["#facc15", "#eab308", "#a16207"];   // warm — yellow
  if (t > 400)  return ["#f87171", "#ef4444", "#b91c1c"];   // hot-warm — red
  if (t > 250)  return ["#4ade80", "#22c55e", "#15803d"];   // habitable — green
  if (t > 150)  return ["#38bdf8", "#0ea5e9", "#0369a1"];   // cool — blue
  return ["#a78bfa", "#8b5cf6", "#6d28d9"];                  // cold — violet
}

interface Props {
  planet: Planet;
  size?: number;
  showOrbits?: boolean;
  animated?: boolean;
}

export function PlanetVisualization({
  planet, size = 120, showOrbits = true, animated = true,
}: Props) {
  const [hi, mid, lo] = getPlanetPalette(planet);
  const r = planet.radiusEarth;
  const scale = r === null ? 1 : Math.min(Math.max(r, 0.3), 14);
  const bodySize = Math.min(Math.max((size * 0.34 * Math.sqrt(scale / 3)), size * 0.18), size * 0.6);

  return (
    <div style={{
      position: "relative", width: size, height: size,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      {showOrbits && (
        <>
          <div style={{
            position: "absolute",
            width: size * 0.93, height: size * 0.93,
            borderRadius: "50%", border: `1px solid ${hi}18`,
            animation: animated ? "orbit-cw 18s linear infinite" : undefined,
          }} />
          <div style={{
            position: "absolute",
            width: size * 0.72, height: size * 0.72,
            borderRadius: "50%", border: `1px solid ${mid}22`,
            animation: animated ? "orbit-ccw 12s linear infinite" : undefined,
          }} />
        </>
      )}

      {/* Planet glow bloom */}
      <div style={{
        position: "absolute",
        width: bodySize * 2.2, height: bodySize * 2.2,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${hi}22 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      {/* Planet body */}
      <div style={{
        position: "relative",
        width: bodySize, height: bodySize,
        borderRadius: "50%",
        background: `radial-gradient(circle at 35% 32%, ${hi} 0%, ${mid} 45%, ${lo} 100%)`,
        boxShadow: `
          0 0 ${bodySize * 0.5}px ${hi}55,
          0 0 ${bodySize * 0.25}px ${mid}88,
          inset -${bodySize * 0.12}px -${bodySize * 0.08}px ${bodySize * 0.18}px rgba(0,0,0,0.4)
        `,
        animation: animated && showOrbits ? "float-slow 7s ease-in-out infinite" : undefined,
        zIndex: 2,
      }}>
        {/* Surface shimmer */}
        <div style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          background: `radial-gradient(ellipse at 30% 25%, rgba(255,255,255,0.12) 0%, transparent 50%)`,
        }} />
        {/* Shadow terminator */}
        <div style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          background: `radial-gradient(ellipse at 68% 65%, rgba(0,0,0,0.35) 0%, transparent 55%)`,
        }} />
      </div>
    </div>
  );
}
