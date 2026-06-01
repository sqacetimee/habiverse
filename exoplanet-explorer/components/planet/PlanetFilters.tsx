"use client";

import { RotateCcw, Heart } from "lucide-react";
import type { FilterState } from "@/lib/types";

interface PlanetFiltersProps {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  discoveryMethods: string[];
  onReset: () => void;
}

const inputStyle: React.CSSProperties = {
  background: "rgba(13,18,45,0.7)",
  border: "1px solid rgba(99,102,241,0.2)",
  color: "#e0e7ff",
  borderRadius: 7,
  padding: "5px 8px",
  fontSize: 12,
  width: "100%",
  outline: "none",
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: "pointer",
  appearance: "none",
  WebkitAppearance: "none",
};

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5, minWidth: 0 }}>
      <span style={{
        fontSize: 10, fontWeight: 600, letterSpacing: "0.08em",
        textTransform: "uppercase", color: "#818cf8",
      }}>
        {label}
      </span>
      {children}
    </div>
  );
}

function RangeGroup({
  label, minVal, maxVal,
  onMin, onMax, minPh, maxPh,
}: {
  label: string; minVal: string; maxVal: string;
  onMin: (v: string) => void; onMax: (v: string) => void;
  minPh?: string; maxPh?: string;
}) {
  return (
    <Group label={label}>
      <div style={{ display: "flex", gap: 4 }}>
        <input type="number" value={minVal} onChange={e => onMin(e.target.value)}
          placeholder={minPh ?? "Min"} style={{ ...inputStyle, width: 70 }} />
        <input type="number" value={maxVal} onChange={e => onMax(e.target.value)}
          placeholder={maxPh ?? "Max"} style={{ ...inputStyle, width: 70 }} />
      </div>
    </Group>
  );
}

export function PlanetFilters({ filters, onChange, discoveryMethods, onReset }: PlanetFiltersProps) {
  const set = (key: keyof FilterState) => (val: string | boolean) =>
    onChange({ ...filters, [key]: val });

  const hasActive =
    filters.radiusMin || filters.radiusMax ||
    filters.massMin   || filters.massMax   ||
    filters.orbitalPeriodMin || filters.orbitalPeriodMax ||
    filters.tempMin   || filters.tempMax   ||
    filters.discoveryMethod  || filters.habitabilityMin ||
    filters.confidenceMin    || filters.showFavoritesOnly;

  return (
    <div style={{
      display: "flex", flexWrap: "wrap", alignItems: "flex-end",
      gap: "12px 20px",
    }}>
      {/* Radius */}
      <RangeGroup label="Radius (R⊕)"
        minVal={filters.radiusMin} maxVal={filters.radiusMax}
        onMin={set("radiusMin")} onMax={set("radiusMax")}
        minPh="0" maxPh="20"
      />

      {/* Mass */}
      <RangeGroup label="Mass (M⊕)"
        minVal={filters.massMin} maxVal={filters.massMax}
        onMin={set("massMin")} onMax={set("massMax")}
        minPh="0" maxPh="1000"
      />

      {/* Period */}
      <RangeGroup label="Period (days)"
        minVal={filters.orbitalPeriodMin} maxVal={filters.orbitalPeriodMax}
        onMin={set("orbitalPeriodMin")} onMax={set("orbitalPeriodMax")}
        minPh="0" maxPh="10000"
      />

      {/* Temperature */}
      <RangeGroup label="Temp (K)"
        minVal={filters.tempMin} maxVal={filters.tempMax}
        onMin={set("tempMin")} onMax={set("tempMax")}
        minPh="0" maxPh="5000"
      />

      {/* Detection method */}
      <Group label="Method">
        <select
          value={filters.discoveryMethod}
          onChange={e => set("discoveryMethod")(e.target.value)}
          style={{ ...selectStyle, width: 140 }}
        >
          <option value="" style={{ background: "#0a0e26" }}>All methods</option>
          {discoveryMethods.map(m => (
            <option key={m} value={m} style={{ background: "#0a0e26" }}>{m}</option>
          ))}
        </select>
      </Group>

      {/* Min score */}
      <Group label="Min score">
        <input type="number" value={filters.habitabilityMin}
          onChange={e => set("habitabilityMin")(e.target.value)}
          placeholder="0" style={{ ...inputStyle, width: 70 }} />
      </Group>

      {/* Min confidence */}
      <Group label="Min data %">
        <input type="number" value={filters.confidenceMin}
          onChange={e => set("confidenceMin")(e.target.value)}
          placeholder="0" style={{ ...inputStyle, width: 70 }} />
      </Group>

      {/* Favourites + reset */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
        <button
          onClick={() => set("showFavoritesOnly")(!filters.showFavoritesOnly)}
          style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "5px 10px", borderRadius: 7, cursor: "pointer", fontSize: 12,
            background: filters.showFavoritesOnly ? "rgba(244,63,94,0.12)" : "rgba(13,18,45,0.7)",
            border: `1px solid ${filters.showFavoritesOnly ? "rgba(244,63,94,0.3)" : "rgba(99,102,241,0.2)"}`,
            color: filters.showFavoritesOnly ? "#fb7185" : "rgba(165,180,252,0.6)",
            marginBottom: 1,
          }}
        >
          <Heart size={12} fill={filters.showFavoritesOnly ? "#f43f5e" : "none"} />
          Favourites
        </button>

        {hasActive && (
          <button
            onClick={onReset}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "5px 10px", borderRadius: 7, cursor: "pointer",
              fontSize: 12, color: "rgba(165,180,252,0.5)",
              background: "transparent", border: "1px solid rgba(99,102,241,0.15)",
              marginBottom: 1,
            }}
          >
            <RotateCcw size={11} /> Reset
          </button>
        )}
      </div>
    </div>
  );
}
