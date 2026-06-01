"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePlanets } from "@/components/providers/PlanetsProvider";
import { PlanetVisualization } from "@/components/planet/PlanetVisualization";
import { HabitabilityBadge } from "@/components/planet/HabitabilityBadge";
import { getScoreColor, formatNumber } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export function TopCandidates() {
  const { planets, loading } = usePlanets();

  const top = useMemo(() =>
    [...planets]
      .filter((p) => p.dataConfidence >= 50)
      .sort((a, b) => b.habitabilityScore - a.habitabilityScore)
      .slice(0, 8),
    [planets]
  );

  if (loading || top.length === 0) return null;

  return (
    <section style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px 80px" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <div style={{
            fontSize: 11, fontWeight: 600, letterSpacing: "0.1em",
            textTransform: "uppercase", color: "#818cf8",
            background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)",
            borderRadius: 99, padding: "3px 12px", display: "inline-block", marginBottom: 10,
          }}>
            Best Earth-like Candidates
          </div>
          <h2 style={{
            fontSize: "clamp(20px,3vw,26px)", fontWeight: 700,
            letterSpacing: "-0.03em", margin: 0,
            background: "linear-gradient(135deg, #e2e8f0, #c7d2fe)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Top Scoring Exoplanets
          </h2>
        </div>
        <Link href="/explore?sort=habitability" style={{
          display: "flex", alignItems: "center", gap: 6,
          fontSize: 13, fontWeight: 500, color: "#818cf8",
          textDecoration: "none",
          padding: "7px 14px", borderRadius: 9,
          border: "1px solid rgba(99,102,241,0.2)",
          background: "rgba(99,102,241,0.07)",
          transition: "all 0.18s ease",
        }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(99,102,241,0.14)";
            e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(99,102,241,0.07)";
            e.currentTarget.style.borderColor = "rgba(99,102,241,0.2)";
          }}
        >
          View all <ArrowRight size={13} />
        </Link>
      </div>

      {/* Scrollable row */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: 12,
      }}>
        {top.map((planet, i) => {
          const col = getScoreColor(planet.habitabilityScore);
          return (
            <Link key={planet.id} href={`/planets/${planet.id}`} style={{ textDecoration: "none" }}>
              <div
                style={{
                  padding: 16, borderRadius: 16, cursor: "pointer",
                  background: "rgba(13,18,45,0.6)",
                  border: "1px solid rgba(99,102,241,0.14)",
                  backdropFilter: "blur(20px)",
                  transition: "all 0.22s cubic-bezier(0.4,0,0.2,1)",
                  boxShadow: "0 0 0 1px rgba(99,102,241,0.07) inset, 0 1px 0 rgba(255,255,255,0.03) inset",
                  animationDelay: `${i * 60}ms`,
                  display: "flex", flexDirection: "column", gap: 12,
                  height: "100%",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.borderColor = `${col}50`;
                  e.currentTarget.style.boxShadow = `0 12px 40px rgba(0,0,0,0.3), 0 0 20px ${col}18`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "rgba(99,102,241,0.14)";
                  e.currentTarget.style.boxShadow = "0 0 0 1px rgba(99,102,241,0.07) inset, 0 1px 0 rgba(255,255,255,0.03) inset";
                }}
              >
                {/* Rank + planet visual */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 800,
                    background: i === 0 ? "rgba(251,191,36,0.15)" : "rgba(99,102,241,0.1)",
                    color: i === 0 ? "#fbbf24" : "rgba(165,180,252,0.5)",
                    border: `1px solid ${i === 0 ? "rgba(251,191,36,0.3)" : "rgba(99,102,241,0.15)"}`,
                  }}>
                    {i + 1}
                  </div>
                  <PlanetVisualization planet={planet} size={52} showOrbits={false} animated={false} />
                </div>

                {/* Name + star */}
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 600, color: "#e2e8f0",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    marginBottom: 2,
                  }}>
                    {planet.name}
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(165,180,252,0.4)" }}>
                    {planet.hostStar ?? "Unknown star"}
                  </div>
                </div>

                {/* Score */}
                <div>
                  <HabitabilityBadge score={planet.habitabilityScore} size="sm" />
                </div>

                {/* Stats */}
                <div style={{
                  display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5,
                  paddingTop: 10, borderTop: "1px solid rgba(99,102,241,0.08)",
                }}>
                  {[
                    ["Radius", planet.radiusEarth !== null ? `${formatNumber(planet.radiusEarth)} R⊕` : "N/A"],
                    ["Temp", planet.equilibriumTempK !== null ? `${Math.round(planet.equilibriumTempK)} K` : "N/A"],
                  ].map(([label, val]) => (
                    <div key={label} style={{
                      padding: "5px 8px", borderRadius: 7,
                      background: "rgba(99,102,241,0.06)",
                    }}>
                      <div style={{ fontSize: 9, color: "rgba(165,180,252,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#c7d2fe", marginTop: 1 }}>{val}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
