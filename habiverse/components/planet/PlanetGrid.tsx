"use client";

import { useEffect, useRef } from "react";
import type { Planet } from "@/lib/types";
import { PlanetCard } from "./PlanetCard";
import { PlanetCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

interface PlanetGridProps {
  planets: Planet[];
  total?: number;
  loading?: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  favorites: Set<string>;
  onToggleFavorite: (id: string) => void;
  onLoadMore?: () => void;
  onReset?: () => void;
}

const GRID: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
  gap: 12,
  alignItems: "stretch",
};

const CSS = `
  @keyframes cardIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .pcw { height: 100%; animation: cardIn 0.35s cubic-bezier(0.4,0,0.2,1) both; }
`;

export function PlanetGrid({
  planets, total = 0, loading = false, loadingMore = false,
  hasMore = false, favorites, onToggleFavorite, onLoadMore, onReset,
}: PlanetGridProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Keep latest values in refs so the IO callback can read them
  // without being a dependency — prevents the observer from being
  // torn down and recreated on every loadingMore/hasMore change.
  const hasMoreRef    = useRef(hasMore);
  const loadingMoreRef = useRef(loadingMore);
  const loadingRef    = useRef(loading);
  const onLoadMoreRef = useRef(onLoadMore);

  // Sync refs on every render (no effect needed — synchronous)
  hasMoreRef.current    = hasMore;
  loadingMoreRef.current = loadingMore;
  loadingRef.current    = loading;
  onLoadMoreRef.current = onLoadMore;

  // Create the observer exactly once. The callback reads from refs
  // so it always sees fresh values without the effect re-running.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          hasMoreRef.current &&
          !loadingMoreRef.current &&
          !loadingRef.current &&
          onLoadMoreRef.current
        ) {
          try {
            onLoadMoreRef.current();
          } catch {
            // Never let a synchronous throw escape the IO callback
          }
        }
      },
      { rootMargin: "500px", threshold: 0 }
    );

    io.observe(sentinel);
    return () => io.disconnect();
  }, []); // deliberately empty — observer is created once and reads values via refs

  const displayTotal = total > 0 ? total : planets.length;

  /* ── Skeleton ─────────────────────────────────────────────── */
  if (loading) {
    return (
      <>
        <style>{CSS}</style>
        <div style={GRID}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="pcw" style={{ animationDelay: `${i * 25}ms` }}>
              <PlanetCardSkeleton />
            </div>
          ))}
        </div>
        <p style={{
          textAlign: "center", marginTop: 16, fontSize: 12,
          color: "rgba(165,180,252,0.35)", letterSpacing: "0.04em",
        }}>
          Connecting to NASA Exoplanet Archive…
        </p>
        {/* Sentinel always in DOM so the effect can observe it */}
        <div ref={sentinelRef} style={{ height: 1 }} aria-hidden />
      </>
    );
  }

  if (planets.length === 0) {
    return (
      <>
        <EmptyState onReset={onReset} />
        <div ref={sentinelRef} style={{ height: 1 }} aria-hidden />
      </>
    );
  }

  return (
    <>
      <style>{CSS}</style>

      <div style={GRID}>
        {planets.map((planet, i) => (
          <div key={planet.id} className="pcw"
            style={{ animationDelay: `${Math.min(i, 16) * 28}ms` }}>
            <PlanetCard
              planet={planet}
              favorites={favorites}
              onToggleFavorite={onToggleFavorite}
            />
          </div>
        ))}
      </div>

      {/* Sentinel — 500px rootMargin means loading starts before the
          user physically reaches the bottom, keeping it seamless.   */}
      <div ref={sentinelRef} style={{ height: 1 }} aria-hidden />

      {/* Status */}
      <div style={{ marginTop: 20, textAlign: "center" }}>
        {loadingMore ? (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            fontSize: 12, color: "rgba(165,180,252,0.45)",
          }}>
            <span style={{
              width: 12, height: 12, borderRadius: "50%",
              border: "2px solid rgba(99,102,241,0.2)",
              borderTopColor: "#818cf8",
              animation: "spin 0.7s linear infinite",
              display: "inline-block",
            }} />
            Loading more planets…
          </div>
        ) : (
          <p style={{ fontSize: 11, color: "rgba(165,180,252,0.28)", margin: 0 }}>
            {hasMore
              ? `${planets.length.toLocaleString()} of ${displayTotal.toLocaleString()} loaded`
              : `All ${displayTotal.toLocaleString()} planets loaded`}
          </p>
        )}
      </div>
    </>
  );
}
