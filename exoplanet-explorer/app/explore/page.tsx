"use client";

import {
  useState, useMemo, useEffect,
  useTransition, useDeferredValue,
  useCallback,
} from "react";
import { useExoplanets } from "@/hooks/useExoplanets";
import { PlanetGrid } from "@/components/planet/PlanetGrid";
import { PlanetSearch } from "@/components/planet/PlanetSearch";
import { PlanetFilters } from "@/components/planet/PlanetFilters";
import { SortDropdown } from "@/components/planet/SortDropdown";
import { RandomPlanetButton } from "@/components/planet/RandomPlanetButton";
import { DataSourceBadge } from "@/components/data/DataSourceBadge";
import { ErrorState } from "@/components/ui/ErrorState";
import { filterPlanets, sortPlanets, getDiscoveryMethods } from "@/lib/utils";
import type { FilterState, SortKey } from "@/lib/types";
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from "lucide-react";

const DEFAULT_FILTERS: FilterState = {
  search: "", radiusMin: "", radiusMax: "",
  massMin: "", massMax: "", orbitalPeriodMin: "", orbitalPeriodMax: "",
  tempMin: "", tempMax: "", discoveryMethod: "",
  habitabilityMin: "", confidenceMin: "", showFavoritesOnly: false,
};

const FAVORITES_KEY = "exoplanet-favorites";

/* ── Hooks ─────────────────────────────────────────────────── */

function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  useEffect(() => {
    try {
      const s = localStorage.getItem(FAVORITES_KEY);
      if (s) setFavorites(new Set(JSON.parse(s)));
    } catch {}
  }, []);
  const toggle = (id: string) => setFavorites((prev) => {
    const next = new Set(prev);
    if (next.has(id)) { next.delete(id); } else { next.add(id); }
    try { localStorage.setItem(FAVORITES_KEY, JSON.stringify([...next])); } catch {}
    return next;
  });
  return { favorites, toggle };
}

/** Debounces a value — avoids re-filtering on every single keystroke */
function useDebounce<T>(value: T, ms = 180): T {
  const [dv, setDv] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDv(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return dv;
}

/* ── Page ──────────────────────────────────────────────────── */

export default function ExplorePage() {
  const {
    planets, total, hasMore, loading, loadingMore,
    error, usingFallback, lastUpdated, refetch, loadMore,
  } = useExoplanets();
  const { favorites, toggle } = useFavorites();

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [sortKey, setSortKey] = useState<SortKey>("habitability");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // startTransition marks filter/sort updates as non-urgent.
  // React finishes the current render first, then applies the new value.
  // This keeps interactions (typing, clicking) feel instant.
  const [isPending, startTransition] = useTransition();

  const setFiltersTransition = useCallback((f: FilterState) => {
    startTransition(() => setFilters(f));
  }, []);

  const setSortTransition = useCallback((k: SortKey) => {
    startTransition(() => setSortKey(k));
  }, []);

  // Debounce the search string — only re-filter after 180 ms of no typing
  const debouncedSearch = useDebounce(filters.search, 180);
  const debouncedFilters = useMemo(
    () => ({ ...filters, search: debouncedSearch }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [debouncedSearch, filters.radiusMin, filters.radiusMax, filters.massMin,
     filters.massMax, filters.orbitalPeriodMin, filters.orbitalPeriodMax,
     filters.tempMin, filters.tempMax, filters.discoveryMethod,
     filters.habitabilityMin, filters.confidenceMin, filters.showFavoritesOnly]
  );

  const methods = useMemo(() => getDiscoveryMethods(planets), [planets]);

  // Compute filtered+sorted list — potentially 5,000 planets
  const computed = useMemo(() => {
    const f = filterPlanets(planets, debouncedFilters, favorites);
    return sortPlanets(f, sortKey);
  }, [planets, debouncedFilters, sortKey, favorites]);

  // useDeferredValue lets React keep the OLD list on screen while
  // the new list is being computed in the background.
  // The grid re-renders with the new list only when the browser is idle.
  const displayed = useDeferredValue(computed);
  const isStale = displayed !== computed; // true while new list is computing

  const reset = () => setFiltersTransition(DEFAULT_FILTERS);
  const hasFilters = Object.entries(filters).some(([k, v]) =>
    k !== "showFavoritesOnly" ? v !== "" : v === true
  );

  return (
    <>
      <style>{``}</style>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px" }}>

        {/* ── Header ─────────────────────────────────────────── */}
        <div style={{
          display: "flex", alignItems: "flex-end",
          justifyContent: "space-between", flexWrap: "wrap",
          gap: 16, marginBottom: 24,
        }}>
          <div>
            <div style={{
              display: "inline-block", marginBottom: 8, fontSize: 11, fontWeight: 600,
              letterSpacing: "0.1em", textTransform: "uppercase", color: "#818cf8",
              background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)",
              borderRadius: 99, padding: "3px 12px",
            }}>
              Explorer
            </div>
            <h1 style={{
              fontSize: "clamp(22px,4vw,30px)", fontWeight: 700,
              letterSpacing: "-0.03em", margin: 0,
              background: "linear-gradient(135deg,#e2e8f0,#c7d2fe)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              Browse Exoplanets
            </h1>
            <div style={{ marginTop: 8 }}>
              {/* Always show total (5,000) not loaded count */}
              <DataSourceBadge
                lastUpdated={lastUpdated}
                usingFallback={usingFallback}
                planetCount={total > 0 ? total : planets.length}
              />
            </div>
          </div>
          <RandomPlanetButton planets={planets} />
        </div>

        {usingFallback && !loading && (
          <div style={{ marginBottom: 16 }}>
            <ErrorState error={error ?? ""} onRetry={refetch} usingFallback />
          </div>
        )}

        {/* ── Toolbar ────────────────────────────────────────── */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
          marginBottom: 12, padding: "10px 14px", borderRadius: 12,
          background: "rgba(13,18,45,0.5)",
          border: "1px solid rgba(99,102,241,0.12)",
          backdropFilter: "blur(16px)",
        }}>
          {/* Filter toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 12px", borderRadius: 8, cursor: "pointer",
              background: sidebarOpen ? "rgba(99,102,241,0.18)" : "rgba(99,102,241,0.07)",
              border: `1px solid ${sidebarOpen ? "rgba(99,102,241,0.35)" : "rgba(99,102,241,0.15)"}`,
              color: "#818cf8", fontSize: 13, fontWeight: 500,
              transition: "all 0.18s ease", flexShrink: 0,
            }}
          >
            <SlidersHorizontal size={14} />
            Filters
            {sidebarOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>

          {/* Search */}
          <div style={{ flex: 1, minWidth: 160, maxWidth: 380 }}>
            <PlanetSearch
              value={filters.search}
              onChange={(v) => setFilters((f) => ({ ...f, search: v }))}
            />
          </div>

          {/* Right controls */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            marginLeft: "auto", flexShrink: 0,
          }}>
            {/* Pending indicator — replaces "Loading…" when NASA data arrives */}
            {(loading || isPending || isStale) && (
              <span style={{
                fontSize: 11, color: "#818cf8",
                background: "rgba(99,102,241,0.1)",
                border: "1px solid rgba(99,102,241,0.2)",
                borderRadius: 99, padding: "3px 10px",
                letterSpacing: "0.06em",
              }}>
                {loading ? "Loading…" : "Sorting…"}
              </span>
            )}

            <span style={{ fontSize: 13, color: "rgba(165,180,252,0.45)", whiteSpace: "nowrap" }}>
              {displayed.length.toLocaleString()}
              <span style={{ color: "rgba(165,180,252,0.25)", marginLeft: 4 }}>
                / {(total > 0 ? total : planets.length).toLocaleString()}
              </span>
            </span>

            {hasFilters && (
              <button onClick={reset} style={{
                display: "flex", alignItems: "center", gap: 5,
                fontSize: 12, color: "#f87171",
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: 7, padding: "5px 10px", cursor: "pointer",
              }}>
                <X size={11} /> Clear
              </button>
            )}

            <SortDropdown value={sortKey} onChange={setSortTransition} />
          </div>
        </div>

        {/* ── Collapsible filter panel (above the grid) ──────── */}
        {sidebarOpen && (
          <div style={{
            marginBottom: 16,
            padding: "16px 20px",
            borderRadius: 12,
            background: "rgba(13,18,45,0.55)",
            border: "1px solid rgba(99,102,241,0.13)",
            backdropFilter: "blur(16px)",
          }}>
            <PlanetFilters
              filters={filters}
              onChange={setFiltersTransition}
              discoveryMethods={methods}
              onReset={reset}
            />
          </div>
        )}

        {/* ── Planet grid — full width, centered ─────────────── */}
        <div style={{
          opacity: isStale ? 0.6 : 1,
          transition: "opacity 0.15s ease",
        }}>
          <PlanetGrid
            planets={displayed}
            loading={loading}
            loadingMore={loadingMore}
            hasMore={hasMore}
            total={total}
            favorites={favorites}
            onToggleFavorite={toggle}
            onLoadMore={loadMore}
            onReset={reset}
          />
        </div>
      </div>
    </>
  );
}
