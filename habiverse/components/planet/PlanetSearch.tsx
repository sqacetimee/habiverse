"use client";

import { Search, X } from "lucide-react";

interface PlanetSearchProps {
  value: string;
  onChange: (val: string) => void;
}

export function PlanetSearch({ value, onChange }: PlanetSearchProps) {
  return (
    <div className="relative">
      <Search
        size={16}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: "rgba(165,180,252,0.4)" }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by planet name or host star..."
        className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl outline-none transition-all duration-200"
        style={{
          background: "rgba(15,20,50,0.7)",
          border: "1px solid rgba(99,102,241,0.2)",
          color: "#e0e7ff",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "rgba(99,102,241,0.5)";
          e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.08)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "rgba(99,102,241,0.2)";
          e.currentTarget.style.boxShadow = "none";
        }}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3.5 top-1/2 -translate-y-1/2"
          style={{ color: "rgba(165,180,252,0.4)" }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
