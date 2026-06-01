"use client";

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import type { Planet } from "@/lib/types";

const COLORS = ["#6366f1","#8b5cf6","#38bdf8","#22d3ee","#34d399","#a78bfa","#f472b6","#fb923c"];

const TOOLTIP_STYLE = {
  background: "rgba(13,18,45,0.97)",
  border: "1px solid rgba(99,102,241,0.28)",
  borderRadius: 12,
  color: "#e2e8f0",
  fontSize: 12,
  boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
};

interface Props { planets: Planet[] }

export function DiscoveryMethodChart({ planets }: Props) {
  const counts: Record<string, number> = {};
  planets.forEach((p) => {
    if (p.discoveryMethod) counts[p.discoveryMethod] = (counts[p.discoveryMethod] ?? 0) + 1;
  });
  const data = Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data} cx="50%" cy="44%"
          outerRadius={88} innerRadius={48}
          dataKey="value" paddingAngle={2}
          strokeWidth={0}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v, name) => [v, name]} />
        <Legend
          wrapperStyle={{ fontSize: 11, color: "rgba(165,180,252,0.65)", paddingTop: 6 }}
          iconType="circle" iconSize={7}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
