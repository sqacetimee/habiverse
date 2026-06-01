"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";

export interface CompletenessEntry { label: string; pct: number }

interface Props { data: CompletenessEntry[] }

const getColor = (pct: number) => {
  if (pct >= 80) return "#22c55e";
  if (pct >= 60) return "#84cc16";
  if (pct >= 40) return "#eab308";
  return "#f97316";
};

export function DataCompletenessChart({ data }: Props) {
  if (!data.length) return null;
  return (
    <ResponsiveContainer width="100%" height={data.length * 34 + 16}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 40, left: 8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" horizontal={false} />
        <XAxis
          type="number" domain={[0, 100]}
          tick={{ fill: "rgba(165,180,252,0.5)", fontSize: 11 }}
          tickLine={false} axisLine={false}
          tickFormatter={(v) => `${v}%`}
        />
        <YAxis
          type="category" dataKey="label"
          tick={{ fill: "rgba(165,180,252,0.6)", fontSize: 12 }}
          tickLine={false} axisLine={false} width={56}
        />
        <Tooltip
          contentStyle={{
            background: "rgba(15,20,50,0.95)",
            border: "1px solid rgba(99,102,241,0.3)",
            borderRadius: 10, color: "#e0e7ff", fontSize: 12,
          }}
          cursor={{ fill: "rgba(99,102,241,0.06)" }}
          formatter={(v: number) => [`${v}%`, "Available"]}
        />
        <Bar dataKey="pct" radius={[0, 4, 4, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={getColor(entry.pct)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
