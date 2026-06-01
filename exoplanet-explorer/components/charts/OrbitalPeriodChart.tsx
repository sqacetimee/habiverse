"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Planet } from "@/lib/types";

const BINS = [
  { label: "<1d", min: 0, max: 1 },
  { label: "1–10d", min: 1, max: 10 },
  { label: "10–100d", min: 10, max: 100 },
  { label: "100–365d", min: 100, max: 365 },
  { label: "365–1000d", min: 365, max: 1000 },
  { label: ">1000d", min: 1000, max: Infinity },
];

interface Props { planets: Planet[] }

export function OrbitalPeriodChart({ planets }: Props) {
  const data = BINS.map((bin) => ({
    label: bin.label,
    count: planets.filter(
      (p) => p.orbitalPeriodDays !== null && p.orbitalPeriodDays >= bin.min && p.orbitalPeriodDays < bin.max
    ).length,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="perGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.7} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: "rgba(165,180,252,0.5)", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
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
          labelFormatter={(l) => `Period: ${l}`}
        />
        <Bar dataKey="count" fill="url(#perGrad)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
