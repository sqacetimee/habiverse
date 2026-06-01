"use client";

import { DataQualityPanel } from "@/components/data/DataQualityPanel";
import { GlassCard } from "@/components/ui/GlassCard";
import { DataCompletenessChart } from "@/components/charts/DataCompletenessChart";
import { BookOpen, Info } from "lucide-react";
import { DATASET_QUALITY, COMPLETENESS_CHART_DATA } from "@/lib/dataset-stats";

export default function DataQualityPage() {
  return (
    <div style={{ maxWidth: 1020, margin: "0 auto", padding: "32px 24px" }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{
          display: "inline-block", marginBottom: 8,
          fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
          color: "#818cf8", background: "rgba(99,102,241,0.1)",
          border: "1px solid rgba(99,102,241,0.2)", borderRadius: 99, padding: "3px 12px",
        }}>
          Data Quality
        </div>
        <h1 style={{
          fontSize: "clamp(22px, 4vw, 30px)", fontWeight: 700,
          letterSpacing: "-0.03em", margin: "0 0 6px",
          background: "linear-gradient(135deg, #e2e8f0, #c7d2fe)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          Dataset Completeness
        </h1>
        <p style={{ fontSize: 13, color: "rgba(165,180,252,0.45)", margin: 0 }}>
          Field availability across {DATASET_QUALITY.total.toLocaleString()} confirmed exoplanets from NASA pscomppars
        </p>
      </div>

      {/* Main panels */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}
        className="data-grid">
        <DataQualityPanel stats={DATASET_QUALITY} />
        <GlassCard style={{ padding: 22 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "#c7d2fe", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
            Field Availability
          </h3>
          <p style={{ fontSize: 12, color: "rgba(165,180,252,0.4)", margin: "0 0 14px" }}>
            Percentage of {DATASET_QUALITY.total.toLocaleString()} planets with each measurement
          </p>
          <DataCompletenessChart data={COMPLETENESS_CHART_DATA} />
        </GlassCard>
      </div>

      {/* Explanatory cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}
        className="data-grid">
        <GlassCard style={{ padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <BookOpen size={14} style={{ color: "#818cf8" }} />
            <h3 style={{ fontSize: 13, fontWeight: 600, color: "#c7d2fe", margin: 0 }}>Why Data Is Incomplete</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { title: "Transit-only detections", body: "Give radius but not mass. Follow-up radial velocity is required for mass measurement — this is time-consuming and not always performed." },
              { title: "Radial velocity detections", body: "Give mass (as a minimum) but not radius, since no transit shadow is observed." },
              { title: "Equilibrium temperature (78%)", body: "Requires stellar luminosity and albedo. When these are uncertain, temperature may be omitted entirely — this is the least complete key field." },
              { title: "Distance", body: "Depends on parallax measurements (Gaia). Older or faint stars may have less precise astrometry." },
            ].map(({ title, body }) => (
              <div key={title}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#a5b4fc", marginBottom: 3 }}>{title}</div>
                <div style={{ fontSize: 12, lineHeight: 1.6, color: "rgba(165,180,252,0.5)" }}>{body}</div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard style={{ padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Info size={14} style={{ color: "#818cf8" }} />
            <h3 style={{ fontSize: 13, fontWeight: 600, color: "#c7d2fe", margin: 0 }}>About pscomppars</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13, lineHeight: 1.65, color: "rgba(165,180,252,0.55)" }}>
            <p style={{ margin: 0 }}>
              The <strong style={{ color: "#a5b4fc" }}>NASA Exoplanet Archive Planetary Systems Composite Parameters</strong> table
              provides one row per confirmed planet using the best available parameters from the literature.
            </p>
            <p style={{ margin: 0 }}>
              This makes it ideal for <strong style={{ color: "#a5b4fc" }}>population-level statistics</strong>, but individual
              planet values may not always be internally self-consistent as they can come from different papers.
            </p>
            <p style={{ margin: 0 }}>
              For per-planet precision work, the individual parameter table (ps) retains multiple separate measurements
              per planet and is more appropriate.
            </p>
            <a
              href="https://exoplanetarchive.ipac.caltech.edu/docs/pscomppars.html"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#818cf8", fontSize: 12, marginTop: 4 }}
            >
              pscomppars documentation →
            </a>
          </div>
        </GlassCard>
      </div>

      {/* Column mapping */}
      <GlassCard style={{ padding: 22 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: "#c7d2fe", margin: "0 0 16px", letterSpacing: "-0.02em" }}>
          NASA Column Mapping
        </h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr>
                {["NASA Column", "App Field", "Description"].map((h) => (
                  <th key={h} style={{
                    paddingBottom: 10, textAlign: "left",
                    fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em",
                    fontWeight: 600, color: "rgba(165,180,252,0.4)",
                    borderBottom: "1px solid rgba(99,102,241,0.12)",
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["pl_name",         "name",              "Planet name"],
                ["hostname",        "hostStar",          "Host star name"],
                ["st_teff",         "stellarTeff",       "Host star effective temperature (K) — used for ARM scoring"],
                ["disc_year",       "discoveryYear",     "Year of discovery"],
                ["discoverymethod", "discoveryMethod",   "Detection technique"],
                ["pl_rade",         "radiusEarth",       "Planet radius in Earth radii"],
                ["pl_bmasse",       "massEarth",         "Planet mass in Earth masses"],
                ["pl_orbper",       "orbitalPeriodDays", "Orbital period in days"],
                ["pl_eqt",          "equilibriumTempK",  "Equilibrium temperature in Kelvin"],
                ["sy_dist",         "distanceParsecs",   "Distance to system in parsecs"],
              ].map(([nasa, app, desc]) => (
                <tr key={nasa}>
                  <td style={{ padding: "8px 16px 8px 0", borderBottom: "1px solid rgba(99,102,241,0.07)", fontFamily: "monospace", color: "#67e8f9" }}>{nasa}</td>
                  <td style={{ padding: "8px 16px 8px 0", borderBottom: "1px solid rgba(99,102,241,0.07)", fontFamily: "monospace", color: "#c4b5fd" }}>{app}</td>
                  <td style={{ padding: "8px 0", borderBottom: "1px solid rgba(99,102,241,0.07)", color: "rgba(165,180,252,0.5)" }}>{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <style>{`
        @media (max-width: 680px) {
          .data-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
