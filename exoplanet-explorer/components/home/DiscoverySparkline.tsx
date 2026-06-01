"use client";

import { useEffect, useRef, useState } from "react";

// Hard-coded from the full 5 000-planet dataset — no fetch needed.
const YEAR_DATA = [
  { year: 2014, count: 492 },
  { year: 2015, count: 155 },
  { year: 2016, count: 1496 },
  { year: 2017, count: 151 },
  { year: 2018, count: 315 },
  { year: 2019, count: 196 },
  { year: 2020, count: 235 },
  { year: 2021, count: 564 },
  { year: 2022, count: 368 },
  { year: 2023, count: 323 },
  { year: 2024, count: 259 },
  { year: 2025, count: 245 },
  { year: 2026, count: 200 },
];

const MAX = Math.max(...YEAR_DATA.map(d => d.count));
const PEAK = YEAR_DATA.reduce((a, b) => b.count > a.count ? b : a);
const TOTAL = YEAR_DATA.reduce((s, d) => s + d.count, 0);

export function DiscoverySparkline() {
  const [revealed, setRevealed] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setRevealed(true); },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} style={{
      padding: "20px 22px", borderRadius: 16,
      background: "rgba(13,18,45,0.55)",
      border: "1px solid rgba(99,102,241,0.13)",
      backdropFilter: "blur(20px)",
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#c7d2fe", marginBottom: 2 }}>
            Discoveries by Year
          </div>
          <div style={{ fontSize: 11, color: "rgba(165,180,252,0.4)" }}>
            Peak: {PEAK.count.toLocaleString()} planets in {PEAK.year}
          </div>
        </div>
        <div style={{
          fontSize: 10, fontWeight: 600, letterSpacing: "0.08em",
          textTransform: "uppercase", color: "#818cf8",
          background: "rgba(99,102,241,0.1)", borderRadius: 99,
          padding: "2px 8px", border: "1px solid rgba(99,102,241,0.18)",
        }}>
          {TOTAL.toLocaleString()} total
        </div>
      </div>

      {/* Bars */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 60 }}>
        {YEAR_DATA.map(({ year, count }, i) => {
          const pct = count / MAX;
          const isPeak = year === PEAK.year;
          return (
            <div
              key={`bar-${year}`}
              title={`${year}: ${count.toLocaleString()} planets`}
              style={{
                flex: 1, minWidth: 0,
                borderRadius: "3px 3px 0 0",
                background: isPeak
                  ? "linear-gradient(180deg, #a5b4fc, #6366f1)"
                  : "linear-gradient(180deg, rgba(99,102,241,0.75), rgba(99,102,241,0.35))",
                height: revealed ? `${Math.max(pct * 100, 4)}%` : "4%",
                transition: `height 0.55s cubic-bezier(0.4,0,0.2,1) ${i * 40}ms`,
                cursor: "default",
              }}
            />
          );
        })}
      </div>

      {/* X-axis labels */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
        {Array.from(new Set([
          YEAR_DATA[0].year, 2016, 2021, YEAR_DATA[YEAR_DATA.length - 1].year,
        ])).map((y, i) => (
          <span key={`axis-${i}-${y}`} style={{
            fontSize: 9, color: "rgba(165,180,252,0.35)",
            fontVariantNumeric: "tabular-nums",
          }}>
            {y}
          </span>
        ))}
      </div>
    </div>
  );
}
