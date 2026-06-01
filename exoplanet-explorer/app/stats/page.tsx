"use client";

import { useMemo } from "react";
import { useExoplanets } from "@/hooks/useExoplanets";
import { GlassCard } from "@/components/ui/GlassCard";
import { ErrorState } from "@/components/ui/ErrorState";
import { DataSourceBadge } from "@/components/data/DataSourceBadge";
import { RadiusDistributionChart } from "@/components/charts/RadiusDistributionChart";
import { OrbitalPeriodChart } from "@/components/charts/OrbitalPeriodChart";
import { DiscoveriesByYearChart } from "@/components/charts/DiscoveriesByYearChart";
import { DiscoveryMethodChart } from "@/components/charts/DiscoveryMethodChart";
import { HabitabilityDistributionChart } from "@/components/charts/HabitabilityDistributionChart";
import { DataCompletenessChart } from "@/components/charts/DataCompletenessChart";
import { COMPLETENESS_CHART_DATA } from "@/lib/dataset-stats";
import { Lightbulb } from "lucide-react";
import type { Planet } from "@/lib/types";

/* ── helpers ─────────────────────────────────────────────────── */

function ChartCard({ title, description, loading, children }: {
  title: string; description?: string;
  loading?: boolean; children: React.ReactNode;
}) {
  return (
    <GlassCard style={{ padding: 22, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: "#c7d2fe", margin: 0, letterSpacing: "-0.02em" }}>
          {title}
        </h3>
        {loading && (
          <span style={{
            fontSize: 10, color: "#818cf8", background: "rgba(99,102,241,0.1)",
            border: "1px solid rgba(99,102,241,0.2)", borderRadius: 99,
            padding: "2px 8px", letterSpacing: "0.06em", textTransform: "uppercase",
          }}>
            Loading…
          </span>
        )}
      </div>
      {description && (
        <p style={{ fontSize: 12, color: "rgba(165,180,252,0.4)", margin: "0 0 14px" }}>
          {description}
        </p>
      )}
      {children}
    </GlassCard>
  );
}

function generateInsights(planets: Planet[]): string[] {
  if (planets.length < 5) return [];
  const r: string[] = [];

  const mc: Record<string, number> = {};
  planets.forEach((p) => { if (p.discoveryMethod) mc[p.discoveryMethod] = (mc[p.discoveryMethod] ?? 0) + 1; });
  const top = Object.entries(mc).sort((a, b) => b[1] - a[1])[0];
  if (top) r.push(`${top[0]} accounts for ${Math.round((top[1] / planets.length) * 100)}% of detections — the dominant method in this dataset.`);

  const withR = planets.filter((p) => p.radiusEarth !== null);
  if (withR.length > 5) {
    const big = withR.filter((p) => (p.radiusEarth ?? 0) > 1.5).length;
    r.push(`${Math.round((big / withR.length) * 100)}% of planets with measured radii exceed 1.5 R⊕ — most confirmed exoplanets are sub-Neptunes or larger.`);
  }

  const highHab = planets.filter((p) => p.habitabilityScore >= 50).length;
  r.push(`Only ${highHab} planets (${Math.round((highHab / planets.length) * 100)}%) score ≥ 50 — truly Earth-like candidates are rare.`);

  const noMass = planets.filter((p) => p.massEarth === null).length;
  r.push(`Mass is missing for ${Math.round((noMass / planets.length) * 100)}% of planets — typical for transit detections without radial-velocity follow-up.`);

  const years = planets.map((p) => p.discoveryYear ?? 0).filter(Boolean);
  if (years.length > 5) {
    const max = Math.max(...years);
    const recent = planets.filter((p) => (p.discoveryYear ?? 0) >= max - 5).length;
    r.push(`${recent} planets confirmed in the last 5 years — discovery rate accelerating with space telescope missions.`);
  }

  return r;
}

/* ── page ────────────────────────────────────────────────────── */

export default function StatsPage() {
  const { planets, loading, usingFallback, error, refetch, lastUpdated } = useExoplanets();
  const insights = useMemo(() => generateInsights(planets), [planets]);

  // Render charts immediately with whatever data is available.
  // The "loading" badge on each chart fades away when real data arrives.

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px" }}>

      {/* ── Header ───────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
        <div>
          <div style={{
            display: "inline-block", marginBottom: 8, fontSize: 11, fontWeight: 600,
            letterSpacing: "0.1em", textTransform: "uppercase", color: "#818cf8",
            background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)",
            borderRadius: 99, padding: "3px 12px",
          }}>
            Statistics
          </div>
          <h1 style={{
            fontSize: "clamp(22px,4vw,30px)", fontWeight: 700, letterSpacing: "-0.03em", margin: 0,
            background: "linear-gradient(135deg,#e2e8f0,#c7d2fe)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Exoplanet Population
          </h1>
          <div style={{ marginTop: 8 }}>
            <DataSourceBadge lastUpdated={lastUpdated} usingFallback={usingFallback} planetCount={planets.length} />
          </div>
        </div>
      </div>

      {usingFallback && !loading && (
        <div style={{ marginBottom: 20 }}>
          <ErrorState error={error ?? ""} onRetry={refetch} usingFallback />
        </div>
      )}

      {/* ── Insights ─────────────────────────────────────────── */}
      {insights.length > 0 && (
        <GlassCard style={{ padding: 20, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
            <Lightbulb size={15} style={{ color: "#fbbf24" }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#c7d2fe" }}>
              Dataset Insights
              {loading && <span style={{ color: "#818cf8", fontWeight: 400, fontSize: 11, marginLeft: 8 }}>— updating…</span>}
            </span>
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
            {insights.map((ins, i) => (
              <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 9, fontSize: 13, lineHeight: 1.6, color: "rgba(165,180,252,0.65)" }}>
                <span style={{ color: "#6366f1", fontWeight: 700, marginTop: 1, flexShrink: 0 }}>·</span>
                {ins}
              </li>
            ))}
          </ul>
        </GlassCard>
      )}

      {/* ── Charts grid ──────────────────────────────────────── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(360px,1fr))",
        gap: 16, marginBottom: 16,
      }}>
        <ChartCard title="Radius Distribution" loading={loading}
          description="Planet sizes in Earth radii">
          <RadiusDistributionChart planets={planets} />
        </ChartCard>

        <ChartCard title="Orbital Period Distribution" loading={loading}
          description="Orbital period in days — a proxy for distance from the host star">
          <OrbitalPeriodChart planets={planets} />
        </ChartCard>

        <ChartCard title="Discoveries by Year" loading={loading}
          description="Confirmed exoplanet discoveries per calendar year">
          <DiscoveriesByYearChart planets={planets} />
        </ChartCard>

        <ChartCard title="Discovery Methods" loading={loading}
          description="Fraction of confirmed planets by detection technique">
          <DiscoveryMethodChart planets={planets} />
        </ChartCard>

        <ChartCard title="Habitability Score Distribution" loading={loading}
          description="How planets spread across the simplified 0–100 Earth-similarity scale">
          <HabitabilityDistributionChart planets={planets} />
        </ChartCard>

        <ChartCard title="Data Completeness" loading={loading}
          description="Percentage of planets with each key measurement present">
          <DataCompletenessChart data={COMPLETENESS_CHART_DATA} />
        </ChartCard>
      </div>

      {/* ── Footnote ─────────────────────────────────────────── */}
      <GlassCard style={{ padding: 16 }}>
        <p style={{ fontSize: 12, lineHeight: 1.65, color: "rgba(165,180,252,0.4)", margin: 0 }}>
          <strong style={{ color: "#818cf8" }}>Note:</strong> All statistics are derived from the NASA Exoplanet Archive
          pscomppars table as loaded in this session. Habitability scores are simplified estimates.
          Missing values are excluded from charts rather than counted as zero.
        </p>
      </GlassCard>
    </div>
  );
}
