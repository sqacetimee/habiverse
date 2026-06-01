"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useExoplanets } from "@/hooks/useExoplanets";
import { GlassCard } from "@/components/ui/GlassCard";
import { LoadingState } from "@/components/ui/LoadingState";
import { HabitabilityBadge } from "@/components/planet/HabitabilityBadge";
import { PlanetVisualization } from "@/components/planet/PlanetVisualization";
import { sortPlanets } from "@/lib/utils";
import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";

const FACTORS = [
  {
    id: "radius",
    label: "Planetary Radius",
    weight: "20%",
    color: "#818cf8",
    ideal: "0.85 – 1.6 R⊕",
    why: "The radius gap at ~1.8 R⊕ (Fulton et al. 2017) separates rocky worlds from volatile-rich sub-Neptunes. Planets below this boundary are statistically more likely to have solid surfaces. The curve peaks at 1.0 R⊕ and drops steeply past 1.8 R⊕.",
    missing: "0.32 — radius is the most commonly measured field; its absence is penalised.",
  },
  {
    id: "gravity",
    label: "Surface Gravity",
    weight: "15%",
    color: "#a78bfa",
    ideal: "0.4 – 1.8 g⊕  (g ∝ M/R²)",
    why: "Surface gravity determines whether a planet can retain an atmosphere over geological time. Below 0.25g, lighter molecules (H₂O, CO₂) escape readily. Above 3g, atmospheric surface pressure becomes crushing and complex biochemistry is increasingly difficult.",
    missing: "0.38 — requires both mass and radius; often available for well-characterised planets.",
  },
  {
    id: "density",
    label: "Bulk Density Proxy",
    weight: "15%",
    color: "#c4b5fd",
    ideal: "0.7 – 1.5 × Earth (5.51 g cm⁻³)",
    why: "Bulk density (ρ ∝ M/R³) distinguishes rocky worlds from volatile-enveloped ones. Earth's density is 5.51 g/cm³. Densities near this value indicate an iron/silicate interior consistent with a habitable surface. Very low densities suggest large gaseous envelopes.",
    missing: "0.38 — same data requirements as surface gravity.",
  },
  {
    id: "thermal",
    label: "Thermal Habitability",
    weight: "28%",
    color: "#38bdf8",
    ideal: "240 – 270 K equilibrium temperature",
    why: "Equilibrium temperature is the strongest single predictor of surface liquid-water potential. The curve peaks at 255 K — Earth's own equilibrium temperature (the 288 K surface temperature includes a 33 K greenhouse offset not captured by pl_eqt). Kepler-442 b at 241 K and Kepler-452 b at 265 K are both very close to this peak. Below 195 K, CO₂ atmospheric collapse is probable; above 350 K, runaway greenhouse risk escalates rapidly.",
    missing: "0.28 — the largest missing-data penalty, reflecting how central temperature is to the model.",
  },
  {
    id: "orbital",
    label: "Orbital Period & Tidal-Lock Risk",
    weight: "12%",
    color: "#34d399",
    ideal: "200 – 700 days (with thermal cross-check)",
    why: "Orbital period proxies stellar distance. Planets with P < 5 d are very likely tidally locked, keeping one hemisphere in permanent daylight. M-dwarf habitable zones have short periods (10–50 d); a cross-consistency bonus (+8%) applies when both temperature and period independently suggest habitable conditions.",
    missing: "0.34 — mild penalty; temperature is a more direct habitability indicator.",
  },
  {
    id: "atmo",
    label: "Atmospheric Retention Index",
    weight: "10%",
    color: "#fbbf24",
    ideal: "Jeans parameter g/T_norm ≈ 1 (Earth baseline)",
    why: "A simplified Jeans escape estimate: the ratio of surface gravity to normalised equilibrium temperature approximates how well a planet retains molecular gas. High gravity and low temperature favour retention of water vapour, CO₂, and nitrogen — essential for habitable surface chemistry.",
    missing: "0.36 — requires all three of radius, mass, and temperature.",
  },
  {
    id: "confidence",
    label: "Data Completeness",
    weight: "5%",
    color: "#fb923c",
    ideal: "All 6 key fields measured",
    why: "Temperature and radius are weighted 2× in the confidence calculation; mass 1.5×; period 1×; distance and method 0.5× each. Well-characterised planets receive a small bonus; poorly measured ones are mildly penalised to reflect the additional uncertainty in their scores.",
    missing: "—",
  },
];

const SIMPLE_STEPS = [
  {
    icon: "🌍",
    title: "Is it the right size?",
    body: "Planets close to Earth's size (0.8–1.6× Earth's radius) are most likely to be rocky with a solid surface. Too small and they can't hold an atmosphere; too large and they're probably a gas giant with no surface at all.",
  },
  {
    icon: "🌡️",
    title: "Is the temperature right for liquid water?",
    body: "This is the biggest factor (28% of the score). Earth's equilibrium temperature is 255 K. Planets in the 240–270 K range score highest — with a greenhouse effect like Earth's, their surfaces could support liquid water.",
  },
  {
    icon: "⭐",
    title: "Is the host star calm enough?",
    body: "M-dwarf stars (dim red stars) blast nearby planets with intense radiation, stripping away atmospheres over time. Planets around quieter K- and G-type stars like our Sun score better. This is calculated using the planet's escape velocity versus the star's XUV output.",
  },
  {
    icon: "🕰️",
    title: "Is the orbit in the right place?",
    body: "Very short orbits (under 10 days) likely mean the planet is tidally locked — one side in permanent daylight, one in permanent darkness. Longer orbits, like Earth's 365-day year, score higher.",
  },
  {
    icon: "📊",
    title: "How confident are we?",
    body: "If key measurements like temperature or mass are missing from the NASA data, the score carries more uncertainty. Planets with all fields measured get a small bonus; those with gaps are noted but not excluded.",
  },
];

export default function ModelPage() {
  const { planets, loading } = useExoplanets();
  const top10 = useMemo(() => sortPlanets(planets, "habitability").slice(0, 10), [planets]);
  const [showTechnical, setShowTechnical] = useState(false);

  return (
    <div style={{ maxWidth: 1020, margin: "0 auto", padding: "32px 24px" }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{
          display: "inline-block", marginBottom: 10, fontSize: 11, fontWeight: 600,
          letterSpacing: "0.1em", textTransform: "uppercase", color: "#818cf8",
          background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)",
          borderRadius: 99, padding: "3px 12px",
        }}>
          Habitability Model
        </div>
        <h1 style={{
          fontSize: "clamp(22px, 4vw, 30px)", fontWeight: 700,
          letterSpacing: "-0.03em", margin: "0 0 10px",
          background: "linear-gradient(135deg, #e2e8f0, #c7d2fe)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          How the Score Works
        </h1>
        <p style={{ fontSize: 14, color: "rgba(165,180,252,0.6)", maxWidth: 560, margin: 0 }}>
          Each planet gets a score from 0–100 measuring how Earth-like its conditions appear,
          based on what NASA has actually measured.
        </p>
      </div>

      {/* Disclaimer */}
      <div style={{
        display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 18px",
        borderRadius: 12, marginBottom: 28,
        background: "rgba(234,179,8,0.07)", border: "1px solid rgba(234,179,8,0.18)",
      }}>
        <AlertTriangle size={15} style={{ color: "#f59e0b", flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 13, lineHeight: 1.65, color: "rgba(253,211,77,0.8)", margin: 0 }}>
          <strong style={{ color: "#fcd34d" }}>Educational model.</strong> Real habitability depends on
          atmospheric composition, stellar radiation, magnetic fields, plate tectonics, and many other
          factors not measurable for most confirmed exoplanets. This score is a data-driven estimate,
          not a scientific confirmation.
        </p>
      </div>

      {/* ── Simple explanation ────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
        {SIMPLE_STEPS.map((s) => (
          <GlassCard key={s.title} style={{ padding: "16px 20px", display: "flex", gap: 16, alignItems: "flex-start" }}>
            <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0, marginTop: 2 }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#c7d2fe", marginBottom: 5 }}>{s.title}</div>
              <p style={{ fontSize: 13, lineHeight: 1.65, color: "rgba(165,180,252,0.6)", margin: 0 }}>{s.body}</p>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* ── Technical details toggle ──────────────────────────── */}
      <button
        onClick={() => setShowTechnical((v) => !v)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 20px", borderRadius: 12, marginBottom: showTechnical ? 20 : 32,
          background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.18)",
          cursor: "pointer", color: "#a5b4fc", fontSize: 13, fontWeight: 600,
          letterSpacing: "-0.01em",
        }}
      >
        <span>Technical details — formula, weights &amp; sub-score curves</span>
        {showTechnical ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {showTechnical && (
        <>
          {/* Master formula */}
          <GlassCard style={{ padding: 22, marginBottom: 20 }}>
            <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "#818cf8", fontWeight: 600, margin: "0 0 14px" }}>
              Score Formula
            </p>
            <pre style={{
              margin: 0, fontSize: 12.5, lineHeight: 2,
              fontFamily: "'Fira Code','Cascadia Code','Consolas',monospace",
              color: "#a5b4fc", overflowX: "auto",
            }}>{`score_raw =
  radius_score          × 0.20   (rocky-world classification)
  + gravity_score       × 0.15   (surface gravity, M/R²)
  + density_score       × 0.15   (bulk density, M/R³)
  + thermal_score       × 0.28   (equilibrium temperature)
  + orbital_score       × 0.12   (period + tidal-lock risk)
  + atmo_score          × 0.10   (Jeans atmospheric retention, g/T)

final = (score_raw × 0.95 + data_confidence × 0.05)
      × temp_multiplier          (hard temperature penalty)
      × stellar_multiplier       (ARM / cosmic-shoreline)
      ∈ [0, 100]`}</pre>
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(99,102,241,0.1)", display: "flex", flexDirection: "column", gap: 8 }}>
              <p style={{ fontSize: 12, color: "rgba(165,180,252,0.4)", margin: 0 }}>
                <code style={{ color: "#67e8f9" }}>temp_multiplier</code> is a piecewise penalty
                (0.35–1×) applied after weighting. A planet at 900 K or 50 K cannot be habitable regardless of other factors.
              </p>
              <p style={{ fontSize: 12, color: "rgba(165,180,252,0.4)", margin: 0 }}>
                <code style={{ color: "#67e8f9" }}>stellar_multiplier</code> applies the{" "}
                <strong style={{ color: "rgba(165,180,252,0.6)" }}>Atmosphere Retention Metric (ARM)</strong> from Zahnle &amp; Catling (2017):
                {" "}ARM = log₁₀(v_esc_rel) − 0.25 × log₁₀(F_XUV_rel), using NASA&rsquo;s measured stellar effective temperature (st_teff)
                to compute the relative XUV flux. Mid-to-late M-dwarfs emit 4–8× more XUV per unit bolometric flux than the Sun,
                driving a multiplier as low as 0.25 for planets that sit below the cosmic shoreline.
                When stellar temperature is unavailable, orbital period is used as a proxy.
              </p>
            </div>
          </GlassCard>

          {/* Factor cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 14, marginBottom: 28 }}>
            {FACTORS.map((f) => (
              <GlassCard key={f.id} style={{ padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: f.color }}>{f.label}</span>
                  <span style={{
                    fontSize: 12, fontWeight: 700, padding: "2px 10px", borderRadius: 99,
                    color: f.color, background: `${f.color}15`, border: `1px solid ${f.color}30`,
                  }}>
                    {f.weight}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 16, marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(165,180,252,0.4)", marginBottom: 2 }}>Ideal range</div>
                    <div style={{ fontSize: 11.5, fontWeight: 600, color: "#c7d2fe" }}>{f.ideal}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(165,180,252,0.4)", marginBottom: 2 }}>Missing default</div>
                    <div style={{ fontSize: 11.5, fontWeight: 600, color: "#c7d2fe" }}>{f.missing}</div>
                  </div>
                </div>
                <p style={{ fontSize: 12, lineHeight: 1.65, color: "rgba(165,180,252,0.55)", margin: 0 }}>{f.why}</p>
              </GlassCard>
            ))}
          </div>
        </>
      )}

      {/* Top 10 */}
      {loading ? (
        <LoadingState message="Loading habitability rankings…" />
      ) : top10.length > 0 && (
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "#c7d2fe", margin: "0 0 14px", letterSpacing: "-0.02em" }}>
            Top 10 by Habitability Score
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {top10.map((p, i) => (
              <Link key={p.id} href={`/planets/${p.id}`} style={{ textDecoration: "none" }}>
                <GlassCard hover style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700,
                    background: i === 0 ? "rgba(251,191,36,0.14)" : "rgba(99,102,241,0.1)",
                    color: i === 0 ? "#fbbf24" : "#818cf8",
                    border: `1px solid ${i === 0 ? "rgba(251,191,36,0.3)" : "rgba(99,102,241,0.2)"}`,
                  }}>
                    {i + 1}
                  </div>
                  <PlanetVisualization planet={p} size={44} showOrbits={false} animated={false} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#c7d2fe", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(165,180,252,0.4)", marginTop: 2 }}>
                      {p.hostStar ?? "Unknown"} · {p.discoveryYear ?? "—"}
                    </div>
                  </div>
                  <HabitabilityBadge score={p.habitabilityScore} />
                </GlassCard>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
