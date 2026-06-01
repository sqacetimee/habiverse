"use client";

import Link from "next/link";
import type { Planet } from "@/lib/types";
import { HabitabilityBadge } from "./HabitabilityBadge";
import { PlanetVisualization } from "./PlanetVisualization";
import { FavoriteButton } from "./FavoriteButton";
import { formatNumber, getScoreColor } from "@/lib/utils";

interface PlanetCardProps {
  planet: Planet;
  favorites: Set<string>;
  onToggleFavorite: (id: string) => void;
}

function statLine(planet: { radiusEarth: number | null; equilibriumTempK: number | null; orbitalPeriodDays: number | null }) {
  const parts: string[] = [];
  if (planet.radiusEarth !== null)       parts.push(`${formatNumber(planet.radiusEarth, 1)} R⊕`);
  if (planet.equilibriumTempK !== null)  parts.push(`${Math.round(planet.equilibriumTempK)} K`);
  if (planet.orbitalPeriodDays !== null) parts.push(`${formatNumber(planet.orbitalPeriodDays, 1)} d`);
  return parts.join("  ·  ") || "—";
}

export function PlanetCard({ planet, favorites, onToggleFavorite }: PlanetCardProps) {
  const scoreColor = getScoreColor(planet.habitabilityScore);

  return (
    <Link
      href={`/planets/${planet.id}`}
      style={{ display: "flex", flexDirection: "column", height: "100%", textDecoration: "none" }}
    >
      <div
        style={{
          flex: 1, display: "flex", flexDirection: "column", gap: 10,
          padding: "14px 14px 12px", borderRadius: 13,
          background: "rgba(13,18,45,0.58)",
          border: "1px solid rgba(99,102,241,0.11)",
          backdropFilter: "blur(16px)",
          transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: "0 1px 0 rgba(255,255,255,0.035) inset",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget;
          el.style.transform = "translateY(-2px)";
          el.style.borderColor = `${scoreColor}38`;
          el.style.boxShadow = `0 1px 0 rgba(255,255,255,0.05) inset, 0 12px 32px rgba(0,0,0,0.28), 0 0 20px ${scoreColor}14`;
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget;
          el.style.transform = "translateY(0)";
          el.style.borderColor = "rgba(99,102,241,0.11)";
          el.style.boxShadow = "0 1px 0 rgba(255,255,255,0.035) inset";
        }}
      >
        {/* Header: name + fav */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 13, fontWeight: 700, letterSpacing: "-0.02em",
              color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {planet.name}
            </div>
            <div style={{
              fontSize: 11, color: "rgba(165,180,252,0.4)", marginTop: 1,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {planet.hostStar ?? "Unknown star"}
            </div>
          </div>
          <FavoriteButton planetId={planet.id} favorites={favorites} onToggle={onToggleFavorite} size={13} />
        </div>

        {/* Planet visual + score */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <PlanetVisualization planet={planet} size={52} showOrbits={false} animated={false} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <HabitabilityBadge score={planet.habitabilityScore} size="sm" />
            {planet.discoveryMethod && (
              <div style={{
                fontSize: 10, color: "rgba(165,180,252,0.35)",
                marginTop: 5, letterSpacing: "0.04em",
              }}>
                {planet.discoveryMethod}{planet.discoveryYear ? ` · ${planet.discoveryYear}` : ""}
              </div>
            )}
          </div>
        </div>

        {/* Stats — single compact line */}
        <div style={{
          fontSize: 11, color: "rgba(165,180,252,0.45)",
          paddingTop: 8, borderTop: "1px solid rgba(99,102,241,0.08)",
          letterSpacing: "0.01em", lineHeight: 1.5,
        }}>
          {statLine(planet)}
        </div>
      </div>
    </Link>
  );
}
