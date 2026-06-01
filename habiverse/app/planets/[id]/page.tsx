"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft, Star, Calendar, Search, Ruler, Weight,
  Clock, Thermometer, MapPin, AlertTriangle,
} from "lucide-react";
import { useExoplanets } from "@/hooks/useExoplanets";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlowButton } from "@/components/ui/GlowButton";
import { LoadingState } from "@/components/ui/LoadingState";
import { HabitabilityBadge } from "@/components/planet/HabitabilityBadge";
import { DataConfidenceBadge } from "@/components/planet/DataConfidenceBadge";
import { PlanetVisualization } from "@/components/planet/PlanetVisualization";
import { FavoriteButton } from "@/components/planet/FavoriteButton";
import { EarthSimilarityRadarChart } from "@/components/charts/EarthSimilarityRadarChart";
import { DataSourceBadge } from "@/components/data/DataSourceBadge";
import { formatNumber, formatDistance, formatTemp, getPlanetInsightText } from "@/lib/utils";
import { getStellarClass } from "@/lib/habitability";
import type { Planet } from "@/lib/types";

const FAVORITES_KEY = "exoplanet-favorites";

function StatCard({ icon, label, value, sub }: {
  icon: React.ReactNode; label: string; value: string; sub?: string;
}) {
  return (
    <GlassCard style={{ padding: "16px 18px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 9, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.18)",
          color: "#818cf8",
        }}>
          {icon}
        </div>
        <div>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 500, color: "rgba(165,180,252,0.45)", marginBottom: 3 }}>
            {label}
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0", lineHeight: 1.3 }}>{value}</div>
          {sub && <div style={{ fontSize: 11, marginTop: 2, color: "rgba(165,180,252,0.38)" }}>{sub}</div>}
        </div>
      </div>
    </GlassCard>
  );
}

function RelatedPlanets({ current, planets }: { current: Planet; planets: Planet[] }) {
  const related = planets
    .filter((p) => p.id !== current.id)
    .map((p) => ({
      p,
      diff: Math.abs((p.radiusEarth ?? 0) - (current.radiusEarth ?? 0)) +
            Math.abs(p.habitabilityScore - current.habitabilityScore) / 10,
    }))
    .sort((a, b) => a.diff - b.diff)
    .slice(0, 4)
    .map((x) => x.p);

  if (!related.length) return null;

  return (
    <div style={{ marginTop: 40 }}>
      <h2 style={{ fontSize: 16, fontWeight: 600, color: "#c7d2fe", margin: "0 0 16px", letterSpacing: "-0.02em" }}>
        Similar Planets
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px,1fr))", gap: 12 }}>
        {related.map((p) => (
          <Link key={p.id} href={`/planets/${p.id}`} style={{ textDecoration: "none" }}>
            <GlassCard hover style={{ padding: 14, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <PlanetVisualization planet={p} size={56} showOrbits={false} animated={false} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#c7d2fe", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 130 }}>{p.name}</div>
                <div style={{ marginTop: 4 }}>
                  <HabitabilityBadge score={p.habitabilityScore} size="sm" />
                </div>
              </div>
            </GlassCard>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function PlanetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { planets, loading, lastUpdated, usingFallback } = useExoplanets();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const s = localStorage.getItem(FAVORITES_KEY);
      if (s) setFavorites(new Set(JSON.parse(s)));
    } catch {}
  }, []);

  const toggleFav = (pid: string) => setFavorites((prev) => {
    const next = new Set(prev);
    if (next.has(pid)) { next.delete(pid); } else { next.add(pid); }
    try { localStorage.setItem(FAVORITES_KEY, JSON.stringify([...next])); } catch {}
    return next;
  });

  if (loading) return <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 24px" }}><LoadingState /></div>;

  const planet = planets.find((p) => p.id === id);

  if (!planet) {
    return (
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
        <div style={{
          width: 56, height: 56, borderRadius: "50%", margin: "0 auto 20px",
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)",
        }}>
          <AlertTriangle size={24} style={{ color: "#f87171" }} />
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#e2e8f0", marginBottom: 8 }}>Planet not found</h1>
        <p style={{ fontSize: 14, color: "rgba(165,180,252,0.45)", marginBottom: 24 }}>
          No planet with ID &ldquo;{id}&rdquo; was found in the loaded dataset.
        </p>
        <GlowButton href="/explore" variant="secondary">
          <ArrowLeft size={14} /> Back to Explorer
        </GlowButton>
      </div>
    );
  }

  const insight = getPlanetInsightText(planet);

  return (
    <div style={{ maxWidth: 1020, margin: "0 auto", padding: "32px 24px" }}>

      {/* Nav row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 32 }}>
        <GlowButton href="/explore" variant="ghost" size="sm">
          <ArrowLeft size={14} /> Explorer
        </GlowButton>
        <DataSourceBadge lastUpdated={lastUpdated} usingFallback={usingFallback} />
      </div>

      {/* Hero */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, marginBottom: 32, alignItems: "center" }}
        className="detail-hero">
        <div style={{ display: "flex", justifyContent: "center", padding: "24px 0" }}>
          <PlanetVisualization planet={planet} size={240} showOrbits animated />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
              <Star size={13} style={{ color: "rgba(250,204,21,0.65)" }} />
              <span style={{ fontSize: 13, color: "rgba(165,180,252,0.5)" }}>
                {planet.hostStar ?? "Unknown host star"}
              </span>
            </div>
            <h1 style={{
              fontSize: "clamp(26px, 5vw, 38px)", fontWeight: 800,
              letterSpacing: "-0.035em", lineHeight: 1.08, margin: 0,
              background: "linear-gradient(135deg, #f1f5f9, #c7d2fe)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              {planet.name}
            </h1>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
            <HabitabilityBadge score={planet.habitabilityScore} size="lg" />
            <DataConfidenceBadge confidence={planet.dataConfidence} />
            <FavoriteButton planetId={planet.id} favorites={favorites} onToggle={toggleFav} size={18} />
          </div>

          {planet.discoveryMethod && (
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <Search size={13} style={{ color: "rgba(165,180,252,0.38)" }} />
              <span style={{ fontSize: 13, color: "rgba(165,180,252,0.5)" }}>
                {planet.discoveryMethod}{planet.discoveryYear ? ` · ${planet.discoveryYear}` : ""}
              </span>
            </div>
          )}

          <DataConfidenceBadge confidence={planet.dataConfidence} showBar />
        </div>
      </div>

      {/* Stat cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: 12, marginBottom: 24,
      }}>
        <StatCard icon={<Ruler size={15} />} label="Radius"
          value={planet.radiusEarth !== null ? `${formatNumber(planet.radiusEarth, 2)}× Earth` : "N/A"}
          sub={planet.radiusEarth !== null ? `~${(planet.radiusEarth * 6371).toFixed(0)} km` : undefined} />
        <StatCard icon={<Weight size={15} />} label="Mass"
          value={planet.massEarth !== null ? `${formatNumber(planet.massEarth, 2)}× Earth` : "N/A"} />
        <StatCard icon={<Clock size={15} />} label="Orbital Period"
          value={planet.orbitalPeriodDays !== null ? `${formatNumber(planet.orbitalPeriodDays, 1)} days` : "N/A"}
          sub={planet.orbitalPeriodDays !== null ? `${(planet.orbitalPeriodDays / 365.25).toFixed(2)} years` : undefined} />
        <StatCard icon={<Thermometer size={15} />} label="Eq. Temperature"
          value={formatTemp(planet.equilibriumTempK)} />
        <StatCard icon={<MapPin size={15} />} label="Distance"
          value={formatDistance(planet.distanceParsecs, planet.distanceLightYears)}
          sub={planet.distanceParsecs !== null ? `${planet.distanceParsecs.toFixed(2)} pc` : undefined} />
        <StatCard icon={<Calendar size={15} />} label="Discovery"
          value={planet.discoveryYear ? String(planet.discoveryYear) : "N/A"}
          sub={planet.discoveryMethod ?? undefined} />
        <StatCard icon={<Star size={15} />} label="Host Star Type"
          value={getStellarClass(planet.stellarTeff ?? null)}
          sub={planet.stellarTeff != null ? `${(planet.stellarTeff as number).toFixed(0)} K` : undefined} />
      </div>

      {/* Radar + analysis */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}
        className="detail-bottom">
        <GlassCard style={{ padding: 22 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: "#c7d2fe", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
            Earth Similarity Radar
          </h2>
          <p style={{ fontSize: 12, color: "rgba(165,180,252,0.4)", margin: "0 0 12px" }}>
            Dashed ring = Earth baseline
          </p>
          <EarthSimilarityRadarChart planet={planet} />
        </GlassCard>

        <GlassCard style={{ padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: "#c7d2fe", margin: "0 0 10px", letterSpacing: "-0.02em" }}>
              Habitability Analysis
            </h2>
            <HabitabilityBadge score={planet.habitabilityScore} size="lg" />
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: "rgba(165,180,252,0.65)", margin: 0 }}>
            {insight}
          </p>
          <div style={{ paddingTop: 14, borderTop: "1px solid rgba(99,102,241,0.1)" }}>
            <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, color: "#6366f1", margin: "0 0 10px" }}>
              Score weights
            </p>
            {[
              ["Planetary radius", "20%"],
              ["Surface gravity", "15%"],
              ["Bulk density", "15%"],
              ["Equilibrium temperature", "28%"],
              ["Orbital period", "12%"],
              ["Atmospheric retention (ARM)", "10%"],
            ].map(([l, w]) => (
              <div key={l} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "5px 0", borderBottom: "1px solid rgba(99,102,241,0.07)",
              }}>
                <span style={{ fontSize: 12, color: "rgba(165,180,252,0.55)" }}>{l}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#818cf8" }}>{w}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: "rgba(165,180,252,0.3)", margin: 0, fontStyle: "italic" }}>
            ×stellar-environment multiplier (ARM / cosmic-shoreline) applied after weighting. Scores are a data-driven similarity index, not a confirmation of habitability.
          </p>
        </GlassCard>
      </div>

      <RelatedPlanets current={planet} planets={planets} />

      <style>{`
        @media (max-width: 680px) {
          .detail-hero  { grid-template-columns: 1fr !important; }
          .detail-bottom { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
