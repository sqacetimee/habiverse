"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Zap } from "lucide-react";
import { usePlanets } from "@/components/providers/PlanetsProvider";
import { getScoreColor } from "@/lib/utils";
import type { Planet } from "@/lib/types";

function score(planet: Planet, q: string): number {
  const n = planet.name.toLowerCase();
  const s = (planet.hostStar ?? "").toLowerCase();
  if (n === q) return 100;
  if (n.startsWith(q)) return 90;
  if (n.includes(q)) return 70;
  if (s.includes(q)) return 50;
  return 0;
}

export function QuickSearch() {
  const router = useRouter();
  const { planets } = usePlanets();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const q = query.trim().toLowerCase();
  const results: Planet[] = q.length < 2 ? [] : planets
    .map((p) => ({ p, s: score(p, q) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || b.p.habitabilityScore - a.p.habitabilityScore)
    .slice(0, 8)
    .map((x) => x.p);

  useEffect(() => { setCursor(-1); }, [query]);

  function navigate(planet: Planet) {
    setQuery("");
    setOpen(false);
    router.push(`/planets/${planet.id}`);
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (!open || !results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === "Enter" && cursor >= 0) {
      navigate(results[cursor]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  // Scroll active item into view
  useEffect(() => {
    if (cursor >= 0 && listRef.current) {
      const el = listRef.current.children[cursor] as HTMLElement;
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [cursor]);

  return (
    <div style={{ position: "relative", width: "100%" }}>
      {/* Input */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "11px 16px", borderRadius: 12,
        background: "rgba(13,18,45,0.8)",
        border: `1px solid ${open && q ? "rgba(99,102,241,0.5)" : "rgba(99,102,241,0.22)"}`,
        boxShadow: open && q
          ? "0 0 0 3px rgba(99,102,241,0.1), 0 8px 32px rgba(0,0,0,0.3)"
          : "0 4px 20px rgba(0,0,0,0.2)",
        transition: "all 0.18s ease",
        backdropFilter: "blur(20px)",
      }}>
        <Search size={16} style={{ color: "rgba(165,180,252,0.5)", flexShrink: 0 }} />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={onKey}
          placeholder="Search 5,000 exoplanets — try 'Kepler', 'TRAPPIST', 'TOI'…"
          style={{
            flex: 1, background: "none", border: "none", outline: "none",
            fontSize: 14, color: "#e2e8f0",
          }}
        />
        {query && (
          <button onClick={() => { setQuery(""); inputRef.current?.focus(); }} style={{
            background: "none", border: "none", cursor: "pointer",
            color: "rgba(165,180,252,0.4)", padding: 0, display: "flex",
          }}>
            <X size={14} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && results.length > 0 && (
        <div
          ref={listRef}
          style={{
            position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
            zIndex: 100, borderRadius: 12, overflow: "hidden",
            background: "rgba(10,14,38,0.97)",
            border: "1px solid rgba(99,102,241,0.25)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.08)",
            backdropFilter: "blur(24px)",
            maxHeight: 380, overflowY: "auto",
          }}
        >
          <div style={{
            padding: "8px 14px 6px",
            borderBottom: "1px solid rgba(99,102,241,0.1)",
            fontSize: 10, fontWeight: 600, letterSpacing: "0.1em",
            textTransform: "uppercase", color: "rgba(165,180,252,0.4)",
          }}>
            {results.length} match{results.length !== 1 ? "es" : ""}
          </div>

          {results.map((p, i) => {
            const c = getScoreColor(p.habitabilityScore);
            const active = i === cursor;
            return (
              <div
                key={p.id}
                onMouseDown={() => navigate(p)}
                onMouseEnter={() => setCursor(i)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 14px", cursor: "pointer",
                  background: active ? "rgba(99,102,241,0.12)" : "transparent",
                  borderBottom: "1px solid rgba(99,102,241,0.05)",
                  transition: "background 0.1s",
                }}
              >
                {/* Score dot */}
                <div style={{
                  width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                  background: c, boxShadow: `0 0 8px ${c}`,
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 600, color: "#e2e8f0",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(165,180,252,0.45)", marginTop: 1 }}>
                    {p.hostStar ?? "Unknown star"}
                    {p.discoveryYear ? ` · ${p.discoveryYear}` : ""}
                    {p.radiusEarth !== null ? ` · ${p.radiusEarth.toFixed(2)} R⊕` : ""}
                  </div>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 700, color: c,
                  background: `${c}15`, border: `1px solid ${c}28`,
                  borderRadius: 99, padding: "2px 8px", flexShrink: 0,
                }}>
                  {p.habitabilityScore}
                </span>
              </div>
            );
          })}

          <div style={{
            padding: "8px 14px",
            fontSize: 11, color: "rgba(165,180,252,0.3)",
            display: "flex", alignItems: "center", gap: 5,
          }}>
            <Zap size={10} />
            Press ↑↓ to navigate · Enter to open · Esc to close
          </div>
        </div>
      )}
    </div>
  );
}
