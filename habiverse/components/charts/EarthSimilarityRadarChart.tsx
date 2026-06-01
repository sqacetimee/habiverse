"use client";

import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Legend, Tooltip,
} from "recharts";
import type { Planet } from "@/lib/types";

interface Props { planet: Planet }

function clamp(v: number, lo: number, hi: number) {
  return Math.min(Math.max(v, lo), hi);
}

function normalize(val: number | null, ideal: number, tolerance: number): number {
  if (val === null) return 35;
  return clamp(Math.round((1 - Math.abs(val - ideal) / tolerance) * 100), 0, 100);
}

const TOOLTIP_STYLE = {
  background: "rgba(13,18,45,0.97)",
  border: "1px solid rgba(99,102,241,0.28)",
  borderRadius: 12,
  color: "#e2e8f0",
  fontSize: 12,
  boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
};

export function EarthSimilarityRadarChart({ planet }: Props) {
  const data = [
    { axis: "Radius",      planet: normalize(planet.radiusEarth, 1, 2.5),       earth: 100 },
    { axis: "Mass",        planet: normalize(planet.massEarth, 1, 8),            earth: 100 },
    { axis: "Temperature", planet: normalize(planet.equilibriumTempK, 288, 150), earth: 100 },
    { axis: "Orbit",       planet: normalize(planet.orbitalPeriodDays, 365, 500), earth: 100 },
    { axis: "Data",        planet: planet.dataConfidence,                         earth: 100 },
  ];

  return (
    <ResponsiveContainer width="100%" height={260}>
      <RadarChart data={data} margin={{ top: 16, right: 28, bottom: 16, left: 28 }}>
        <PolarGrid stroke="rgba(99,102,241,0.15)" />
        <PolarAngleAxis
          dataKey="axis"
          tick={{ fill: "rgba(165,180,252,0.65)", fontSize: 11, fontWeight: 500 }}
        />
        <Radar
          name="Earth"
          dataKey="earth"
          stroke="rgba(34,197,94,0.25)"
          fill="rgba(34,197,94,0.05)"
          strokeWidth={1}
          strokeDasharray="5 3"
        />
        <Radar
          name={planet.name}
          dataKey="planet"
          stroke="#6366f1"
          fill="rgba(99,102,241,0.18)"
          strokeWidth={2}
        />
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v, name) => [`${v}%`, name]} />
        <Legend
          wrapperStyle={{ fontSize: 11, color: "rgba(165,180,252,0.65)", paddingTop: 8 }}
          iconType="circle" iconSize={7}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
