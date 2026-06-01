"use client";

import { ArrowUpDown } from "lucide-react";
import type { SortKey } from "@/lib/types";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "habitability",     label: "Most Earth-like" },
  { value: "habitability_asc", label: "Least Earth-like" },
  { value: "confidence",       label: "Highest data confidence" },
  { value: "radius_desc",      label: "Largest planets" },
  { value: "radius_asc",       label: "Smallest planets" },
  { value: "period_asc",       label: "Shortest orbital period" },
  { value: "period_desc",      label: "Longest orbital period" },
  { value: "year_desc",        label: "Newest discoveries" },
  { value: "year_asc",         label: "Oldest discoveries" },
  { value: "distance_asc",     label: "Nearest planets" },
];

interface SortDropdownProps {
  value: SortKey;
  onChange: (val: SortKey) => void;
}

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
      <ArrowUpDown size={13} style={{ color: "rgba(165,180,252,0.45)", flexShrink: 0 }} />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortKey)}
        style={{
          background: "rgba(13,18,45,0.8)",
          border: "1px solid rgba(99,102,241,0.22)",
          color: "#a5b4fc",
          borderRadius: 8,
          padding: "7px 10px",
          fontSize: 13,
          outline: "none",
          cursor: "pointer",
          appearance: "none",
          WebkitAppearance: "none",
        }}
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value} style={{ background: "#0a0e26" }}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
