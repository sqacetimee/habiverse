"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import type { Planet } from "@/lib/types";

const BINS = [
  { label: "<0.5", min: 0, max: 0.5 },
  { label: "0.5–1", min: 0.5, max: 1 },
  { label: "1–1.5", min: 1, max: 1.5 },
  { label: "1.5–2", min: 1.5, max: 2 },
  { label: "2–3", min: 2, max: 3 },
  { label: "3–5", min: 3, max: 5 },
  { label: "5–10", min: 5, max: 10 },
  { label: ">10", min: 10, max: Infinity },
];

interface Props { planets: Planet[] }

export function RadiusDistributionChart({ planets }: Props) {
  const data = BINS.map((bin) => ({
    label: bin.label,
    count: planets.filter(
      (p) => p.radiusEarth !== null && p.radiusEarth >= bin.min && p.radiusEarth < bin.max
    ).length,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="radGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity={0.7} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: "rgba(165,180,252,0.5)", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          label={{ value: "Radius (R⊕)", position: "insideBottom", offset: -4, fill: "rgba(165,180,252,0.4)", fontSize: 10 }}
        />
        <YAxis
          tick={{ fill: "rgba(165,180,252,0.5)", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            background: "rgba(15,20,50,0.95)",
            border: "1px solid rgba(99,102,241,0.3)",
            borderRadius: 10,
            color: "#e0e7ff",
            fontSize: 12,
          }}
          cursor={{ fill: "rgba(99,102,241,0.06)" }}
          formatter={(v) => [v, "Planets"]}
          labelFormatter={(l) => `Radius: ${l} R⊕`}
        />
        <ReferenceLine
          x="1–1.5"
          stroke="rgba(34,197,94,0.4)"
          strokeDasharray="4 3"
          label={{ value: "Earth-like", fill: "rgba(34,197,94,0.6)", fontSize: 10 }}
        />
        <Bar dataKey="count" fill="url(#radGrad)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
