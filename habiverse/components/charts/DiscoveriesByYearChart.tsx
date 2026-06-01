"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { useMemo } from "react";
import type { Planet } from "@/lib/types";

interface Props { planets: Planet[] }

const TOOLTIP_STYLE = {
  background: "rgba(10,14,38,0.97)",
  border: "1px solid rgba(99,102,241,0.28)",
  borderRadius: 10,
  color: "#e2e8f0",
  fontSize: 12,
  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
};

export function DiscoveriesByYearChart({ planets }: Props) {
  const data = useMemo(() => {
    const counts: Record<number, number> = {};
    planets.forEach((p) => {
      if (p.discoveryYear && p.discoveryYear >= 1992) {
        counts[p.discoveryYear] = (counts[p.discoveryYear] ?? 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([year, count]) => ({ year: Number(year), count }))
      .sort((a, b) => a.year - b.year);
  }, [planets]);

  if (!data.length) return null;

  const maxCount = Math.max(...data.map((d) => d.count));

  // Show every Nth year label so text never overlaps
  const interval = data.length > 24 ? 3 : data.length > 14 ? 1 : 0;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart
        data={data}
        margin={{ top: 8, right: 12, left: -8, bottom: 40 }}
        barCategoryGap="18%"
      >
        <defs>
          <linearGradient id="discGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.65} />
          </linearGradient>
        </defs>

        <CartesianGrid
          strokeDasharray="2 4"
          stroke="rgba(99,102,241,0.08)"
          vertical={false}
        />

        <XAxis
          dataKey="year"
          /* Built-in tick — no custom renderer, no key conflicts */
          tick={{ fill: "rgba(165,180,252,0.5)", fontSize: 10.5, fontFamily: "inherit" }}
          tickLine={false}
          axisLine={{ stroke: "rgba(99,102,241,0.1)" }}
          interval={interval}
          angle={-40}
          textAnchor="end"
          height={44}
        />

        <YAxis
          tick={{ fill: "rgba(165,180,252,0.45)", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={34}
        />

        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          cursor={{ fill: "rgba(99,102,241,0.07)" }}
          formatter={(v) => [v, "Discoveries"]}
          labelFormatter={(y) => `Year ${y}`}
        />

        <Bar dataKey="count" radius={[3, 3, 0, 0]}>
          {data.map((entry) => (
            <Cell
              key={`disc-${entry.year}`}
              fill={entry.count === maxCount ? "#a5b4fc" : "url(#discGrad)"}
              opacity={entry.count === maxCount ? 1 : 0.8}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
