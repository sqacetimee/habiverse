"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Telescope, BarChart3, Zap, Globe, ArrowRight, Database, TrendingUp } from "lucide-react";
import { GlowButton } from "@/components/ui/GlowButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { usePlanets } from "@/components/providers/PlanetsProvider";
import { ErrorState } from "@/components/ui/ErrorState";
import { QuickSearch } from "@/components/home/QuickSearch";
import { ParallaxPlanet } from "@/components/home/ParallaxPlanet";
import { TopCandidates } from "@/components/home/TopCandidates";
import { DiscoverySparkline } from "@/components/home/DiscoverySparkline";

function Counter({ target }: { target: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!target) return;
    const steps = 60, dur = 1200;
    let cur = 0;
    const id = setInterval(() => {
      cur = Math.min(cur + target / steps, target);
      setN(Math.round(cur));
      if (cur >= target) clearInterval(id);
    }, dur / steps);
    return () => clearInterval(id);
  }, [target]);
  return <>{n.toLocaleString()}</>;
}

const FEATURES = [
  {
    icon: <Database size={18} />, color: "#6366f1",
    title: "Real NASA Data",
    desc: "Live from the Planetary Systems Composite Parameters table — 5,000+ confirmed exoplanets queried via TAP API.",
  },
  {
    icon: <Zap size={18} />, color: "#8b5cf6",
    title: "Habitability Scoring",
    desc: "A 0–100 score weighing radius, mass, temperature, and orbital period against Earth's parameters.",
  },
  {
    icon: <Globe size={18} />, color: "#38bdf8",
    title: "Earth Comparisons",
    desc: "Radar charts, stat cards, and plain-English analysis of each planet's similarity to Earth.",
  },
  {
    icon: <BarChart3 size={18} />, color: "#34d399",
    title: "Interactive Statistics",
    desc: "Population charts for radii, orbital periods, discovery methods, and temporal trends.",
  },
];

// Hard-coded from the full 5,000-planet dataset (parsed once at build time).
// These never need a fetch — they're facts about the complete NASA archive snapshot.
const DATASET_STATS = {
  total:      5000,
  earthLike:  241,   // habitabilityScore >= 60 (ARM + 255 K thermal peak)
  methods:    11,
  latestYear: 2026,
  topScore:   90,    // Kepler-452 b (G-dwarf, 265 K Teq)
} as const;

export default function HomePage() {
  const { usingFallback, error, refetch, lastUpdated } = usePlanets();

  return (
    <div style={{ position: "relative" }}>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section style={{ minHeight: "calc(100vh - 60px)", display: "flex", alignItems: "center" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "64px 32px", width: "100%" }}>
          <div className="hero-grid" style={{
            display: "grid", gridTemplateColumns: "1fr auto",
            gap: 72, alignItems: "center",
          }}>

            {/* ── Left: copy + search ───────────────────────────── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 28, maxWidth: 580 }}>

              {/* Badge */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                width: "fit-content", padding: "5px 14px", borderRadius: 99,
                background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.22)",
                fontSize: 12, fontWeight: 600, color: "#818cf8",
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: "#6366f1", boxShadow: "0 0 8px #6366f1",
                  animation: "pulse-glow 2s ease-in-out infinite",
                }} />
                {DATASET_STATS.total.toLocaleString()} confirmed exoplanets
              </div>

              {/* Title */}
              <div>
                <h1 style={{
                  fontSize: "clamp(44px, 6vw, 72px)", fontWeight: 800,
                  letterSpacing: "-0.045em", lineHeight: 1.02, margin: "0 0 16px",
                  background: "linear-gradient(135deg, #f1f5f9 0%, #c7d2fe 45%, #a5b4fc 100%)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>
                  Habiverse
                </h1>
                <p style={{
                  fontSize: 17, lineHeight: 1.65, margin: 0,
                  color: "rgba(165,180,252,0.65)", maxWidth: 460,
                }}>
                  Analyze distant worlds, compare planetary systems, and discover which
                  exoplanets could be most Earth-like — powered by real NASA data.
                </p>
              </div>

              {/* Quick search */}
              <div>
                <p style={{
                  fontSize: 11, fontWeight: 600, letterSpacing: "0.08em",
                  textTransform: "uppercase", color: "rgba(165,180,252,0.4)",
                  marginBottom: 8,
                }}>
                  Search any planet
                </p>
                <QuickSearch />
              </div>

              {/* CTAs */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                <GlowButton href="/explore" variant="primary" size="lg">
                  <Telescope size={16} /> Explore All Planets <ArrowRight size={14} />
                </GlowButton>
                <GlowButton href="/model" variant="secondary" size="lg">
                  Habitability Model
                </GlowButton>
              </div>

              {/* Live stats strip — always visible, values from precomputed dataset */}
              {(
                <div style={{
                  display: "grid", gridTemplateColumns: "repeat(4,1fr)",
                  gap: 0, paddingTop: 24,
                  borderTop: "1px solid rgba(99,102,241,0.1)",
                }}>
                  {[
                    { val: <Counter target={DATASET_STATS.total} />, label: "Planets" },
                    { val: <Counter target={DATASET_STATS.earthLike} />,    label: "Earth-like (≥60)" },
                    { val: DATASET_STATS.latestYear,                  label: "Latest year" },
                    { val: <Counter target={DATASET_STATS.topScore} />,      label: "Top score" },
                  ].map((s, i) => (
                    <div key={i} style={{ paddingRight: 12 }}>
                      <div style={{
                        fontSize: "clamp(20px,2.5vw,26px)", fontWeight: 700,
                        color: "#a5b4fc", letterSpacing: "-0.03em", lineHeight: 1,
                      }}>
                        {s.val}
                      </div>
                      <div style={{ fontSize: 11, color: "rgba(165,180,252,0.38)", marginTop: 5 }}>
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Right: interactive planet ─────────────────────── */}
            <div className="hero-planet" style={{ display: "flex", justifyContent: "center" }}>
              <ParallaxPlanet />
            </div>
          </div>
        </div>
      </section>

      {/* Fallback banner */}
      {usingFallback && (
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px 24px" }}>
          <ErrorState error={error ?? ""} onRetry={refetch} usingFallback />
        </div>
      )}

      {/* ── "Habitable" disclaimer ────────────────────────────────── */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px 32px" }}>
        <div style={{
          padding: "18px 22px", borderRadius: 14,
          background: "rgba(234,179,8,0.06)", border: "1px solid rgba(234,179,8,0.16)",
          display: "flex", gap: 16, alignItems: "flex-start",
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.2)",
            fontSize: 15, lineHeight: 1,
          }}>⚠</div>
          <div>
            <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 700, color: "#fcd34d" }}>
              A note on the word &ldquo;habitable&rdquo;
            </p>
            <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.7, color: "rgba(253,211,77,0.72)" }}>
              {`"Habitable" is a misnomer astronomers use loosely. When applied to exoplanets it typically means only: (1) the planet orbits in its star's habitable zone, (2) it is believed to be rocky, and (3) its surface gravity is near 1g. That's it. It does not mean humans could live there. Tidally locked rotation, lethal stellar flares, no magnetic field, no water, toxic or absent atmosphere, extreme pressure, or a permanent deep-freeze could each make such a planet completely uninhabitable — and we cannot measure most of these for confirmed exoplanets. Of all known "habitable zone" candidates, none are likely livable for humans. The scores on this site are a data-driven similarity index, not a scientific confirmation of life or livability.`}
            </p>
          </div>
        </div>
      </section>

      {/* ── Top Earth-like candidates ──────────────────────────── */}
      <TopCandidates />

      {/* ── Discovery sparkline + data note ───────────────────── */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px 80px" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 16, alignItems: "stretch",
        }}
          className="two-col"
        >
          <DiscoverySparkline />

          <GlassCard style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.16)",
                color: "#818cf8",
              }}>
                <TrendingUp size={16} />
              </div>
              <div>
                <h3 style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 600, color: "#c7d2fe" }}>
                  About the data
                </h3>
                <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: "rgba(165,180,252,0.55)" }}>
                  Data comes from the{" "}
                  <a href="https://exoplanetarchive.ipac.caltech.edu/" target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#818cf8", textUnderlineOffset: 3, textDecoration: "underline" }}>
                    NASA Exoplanet Archive
                  </a>{" "}
                  pscomppars table — one composite row per confirmed planet using the best available
                  parameters from the literature. Ideal for population-level statistics.
                </p>
                {lastUpdated && (
                  <p style={{ margin: "8px 0 0", fontSize: 11, color: "rgba(165,180,252,0.28)" }}>
                    Last fetched {lastUpdated.toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            <div style={{
              display: "grid", gridTemplateColumns: "repeat(3,1fr)",
              gap: 8, paddingTop: 14, borderTop: "1px solid rgba(99,102,241,0.1)",
            }}>
              {[
                { val: DATASET_STATS.total.toLocaleString(), label: "Confirmed planets" },
                { val: String(DATASET_STATS.methods),            label: "Detection methods" },
                { val: DATASET_STATS.earthLike.toLocaleString(),    label: "High-scoring (≥60)" },
              ].map(({ val, label }) => (
                <div key={label} style={{
                  padding: "10px 12px", borderRadius: 9,
                  background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.1)",
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#a5b4fc", letterSpacing: "-0.02em" }}>{val}</div>
                  <div style={{ fontSize: 10, color: "rgba(165,180,252,0.4)", marginTop: 3, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </section>

      {/* ── Feature cards ─────────────────────────────────────── */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{
            display: "inline-block", marginBottom: 12,
            fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
            color: "#818cf8", background: "rgba(99,102,241,0.1)",
            border: "1px solid rgba(99,102,241,0.2)", borderRadius: 99, padding: "3px 12px",
          }}>
            What you can do
          </div>
          <h2 style={{
            fontSize: "clamp(22px,4vw,30px)", fontWeight: 700,
            letterSpacing: "-0.03em", margin: "0 0 10px",
            background: "linear-gradient(135deg, #e2e8f0, #c7d2fe)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Built for exploration
          </h2>
          <p style={{ fontSize: 14, color: "rgba(165,180,252,0.5)", maxWidth: 380, margin: "0 auto" }}>
            Everything you need to investigate the known exoplanet population.
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))",
          gap: 16,
        }}>
          {FEATURES.map((f) => (
            <GlassCard key={f.title} hover style={{ padding: 22 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10, marginBottom: 16,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: `${f.color}18`, border: `1px solid ${f.color}28`, color: f.color,
              }}>
                {f.icon}
              </div>
              <h3 style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 600, color: "#c7d2fe" }}>
                {f.title}
              </h3>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: "rgba(165,180,252,0.5)" }}>
                {f.desc}
              </p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* ── Quick nav ─────────────────────────────────────────── */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
          {[
            { href: "/explore",  label: "Explorer",          sub: "Search & filter all planets",  icon: <Telescope size={16} /> },
            { href: "/stats",    label: "Statistics",        sub: "Charts & population trends",   icon: <BarChart3 size={16} /> },
            { href: "/model",    label: "Habitability Model",sub: "How the score works",          icon: <Zap size={16} /> },
            { href: "/data",     label: "Data Quality",      sub: "Field completeness",           icon: <Database size={16} /> },
          ].map((l) => (
            <Link key={l.href} href={l.href} style={{ textDecoration: "none" }}>
              <GlassCard hover style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.18)",
                  color: "#818cf8",
                }}>
                  {l.icon}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#c7d2fe" }}>{l.label}</div>
                  <div style={{ fontSize: 12, color: "rgba(165,180,252,0.45)", marginTop: 2 }}>{l.sub}</div>
                </div>
                <ArrowRight size={14} style={{ color: "rgba(165,180,252,0.3)", flexShrink: 0 }} />
              </GlassCard>
            </Link>
          ))}
        </div>
      </section>

      {/* Responsive overrides */}
      <style>{`
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-planet { display: none !important; }
        }
        @media (max-width: 640px) {
          .two-col { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
