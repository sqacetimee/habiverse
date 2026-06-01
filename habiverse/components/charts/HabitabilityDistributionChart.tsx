"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import type { Planet } from "@/lib/types";

const BINS = [
  { label: "0–10", min: 0, max: 10 },
  { label: "10–20", min: 10, max: 20 },
  { label: "20–30", min: 20, max: 30 },
  { label: "30–40", min: 30, max: 40 },
  { label: "40–50", min: 40, max: 50 },
  { label: "50–60", min: 50, max: 60 },
  { label: "60–70", min: 60, max: 70 },
  { label: "70–80", min: 70, max: 80 },
  { label: "80–90", min: 80, max: 90 },
  { label: "90–100", min: 90, max: 101 },
];

const BIN_COLORS = [
  "#ef4444", "#f97316", "#f97316", "#eab308",
  "#eab308", "#84cc16", "#84cc16", "#22c55e",
  "#22c55e", "#10b981",
];

interface Props { planets: Planet[] }

export function HabitabilityDistributionChart({ planets }: Props) {
  const data = BINS.map((bin, i) => ({
    label: bin.label,
    count: planets.filter(
      (p) => p.habitabilityScore >= bin.min && p.habitabilityScore < bin.max
    ).length,
    fill: BIN_COLORS[i],
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: "rgba(165,180,252,0.5)", fontSize: 10 }}
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
          labelFormatter={(l) => `Score: ${l}`}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
