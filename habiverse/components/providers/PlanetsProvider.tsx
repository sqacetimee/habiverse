"use client";

import {
  createContext, useContext, useState,
  useEffect, useCallback, useRef, ReactNode,
} from "react";
import type { Planet } from "@/lib/types";
import { fallbackPlanets } from "@/lib/fallback-data";
import type { ChunkResponse } from "@/lib/types";

/* ── Context type ────────────────────────────────────────────── */

export interface PlanetsContextValue {
  /** Currently loaded planets (grows as user loads more chunks) */
  planets: Planet[];
  /** Total planets available on the server */
  total: number;
  /** Whether more chunks can be loaded */
  hasMore: boolean;
  /** True only during the very first load */
  loading: boolean;
  /** True while a subsequent "load more" request is in flight */
  loadingMore: boolean;
  error: string | null;
  usingFallback: boolean;
  source: "nasa" | "file" | "cache" | "fallback" | null;
  lastUpdated: Date | null;
  /** Load the next chunk of 100 planets */
  loadMore: () => void;
  /** Restart loading from scratch */
  refetch: () => void;
}

/* ── Constants ───────────────────────────────────────────────── */

const CHUNK = 100;
const CACHE_TTL  = 24 * 60 * 60 * 1000; // 24 h
const LS_KEY = "exo-chunks-v4"; // bumped: stellarTeff field + ARM scoring

/* ── localStorage helpers ────────────────────────────────────── */

interface LSCache { planets: Planet[]; total: number; at: number }

function lsRead(): LSCache | null {
  try {
    const s = localStorage.getItem(LS_KEY);
    if (!s) return null;
    const c: LSCache = JSON.parse(s);
    if (Date.now() - c.at > CACHE_TTL) return null;
    if (!Array.isArray(c.planets) || c.planets.length < 10) return null;
    return c;
  } catch { return null; }
}

function lsWrite(planets: Planet[], total: number) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ planets, total, at: Date.now() }));
  } catch {}
}

/* ── Fetch one chunk from the API ────────────────────────────── */

async function fetchChunk(offset: number): Promise<ChunkResponse> {
  const url = `/api/exoplanets?offset=${offset}&limit=${CHUNK}`;
  // No AbortController — any abort event leaking from the signal
  // can manifest as [object Event] in the unhandledrejection handler.
  // The server-side cache means responses are fast; no timeout needed.
  try {
    const res = await fetch(url);
    if (!res.ok) {
      const body: { error?: string } = await res.json().catch(() => ({}));
      throw new Error(body.error ?? `API error ${res.status}`);
    }
    const data = await res.json();
    return data as ChunkResponse;
  } catch (err) {
    // Normalise everything — including raw Events — into a proper Error
    if (err instanceof Error) throw err;
    throw new Error(
      typeof err === "string" ? err : `Fetch failed: ${String(err)}`
    );
  }
}

/* ── Context + Provider ──────────────────────────────────────── */

const Ctx = createContext<PlanetsContextValue | null>(null);

export function usePlanets(): PlanetsContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePlanets must be used inside <PlanetsProvider>");
  return ctx;
}

export function PlanetsProvider({ children }: { children: ReactNode }) {
  const [planets,      setPlanets]      = useState<Planet[]>([]);
  const [total,        setTotal]        = useState(0);
  const [hasMore,      setHasMore]      = useState(false);
  const [loading,      setLoading]      = useState(true);
  const [loadingMore,  setLoadingMore]  = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [usingFallback,setUsingFallback]= useState(false);
  const [source,       setSource]       = useState<PlanetsContextValue["source"]>(null);
  const [lastUpdated,  setLastUpdated]  = useState<Date | null>(null);
  const [generation,   setGeneration]   = useState(0);

  const mounted     = useRef(true);
  const offsetRef   = useRef(0);   // tracks how many we've loaded so far
  const fetchingRef = useRef(false); // synchronous guard — prevents double-fire from IntersectionObserver

  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  /* ── Initial load ────────────────────────────────────────────── */
  useEffect(() => {
    if (generation > 0) {
      // Full refetch — reset everything
      setPlanets([]); setTotal(0); setHasMore(false);
      offsetRef.current = 0;
    }

    setLoading(true); setError(null); setUsingFallback(false);

    // Check localStorage — show cached data immediately, refresh if stale
    const ls = lsRead();
    if (ls && generation === 0) {
      if (process.env.NODE_ENV === "development") {
        console.log(`[PlanetsProvider] Showing ${ls.planets.length} cached planets instantly`);
      }
      setPlanets(ls.planets);
      setTotal(ls.total);
      offsetRef.current = ls.planets.length;
      setHasMore(ls.planets.length < ls.total);
      setSource("cache");
      setLastUpdated(new Date(ls.at));
      setLoading(false);

      // Silently refresh in background if >1 hour old
      if (Date.now() - ls.at > 60 * 60 * 1000) {
        fetchChunk(0).then((chunk) => {
          if (!mounted.current) return;
          setPlanets(chunk.planets);
          setTotal(chunk.total);
          offsetRef.current = chunk.planets.length;
          setHasMore(chunk.hasMore);
          setSource("nasa");
          setLastUpdated(new Date());
          lsWrite(chunk.planets, chunk.total);
        }).catch(() => {}); // keep cached data on background fail
      }
      return;
    }

    // No cache — fetch first chunk
    fetchChunk(0).then((chunk) => {
      if (!mounted.current) return;
      if (process.env.NODE_ENV === "development") {
        console.log(`[PlanetsProvider] ✓ Loaded ${chunk.planets.length} / ${chunk.total} planets`);
      }
      setPlanets(chunk.planets);
      setTotal(chunk.total);
      offsetRef.current = chunk.planets.length;
      setHasMore(chunk.hasMore);
      setSource("nasa");
      setLastUpdated(new Date());
      setLoading(false);
      lsWrite(chunk.planets, chunk.total);
    }).catch((err) => {
      if (!mounted.current) return;
      if (process.env.NODE_ENV === "development") {
        console.warn("[PlanetsProvider] ⚠ Failed, using fallback:", err.message);
      }
      setPlanets(fallbackPlanets);
      setTotal(fallbackPlanets.length);
      setHasMore(false);
      setUsingFallback(true);
      setSource("fallback");
      setError("Could not reach NASA — showing sample data.");
      setLoading(false);
    });
  }, [generation]); // generation is the only intended dependency

  /* ── Load next chunk ──────────────────────────────────────────── */
  const loadMore = useCallback(() => {
    // fetchingRef is a synchronous guard checked before any state update.
    // This prevents IntersectionObserver from firing loadMore() twice in
    // the same tick (before setLoadingMore(true) has propagated through React).
    if (fetchingRef.current || loadingMore || !hasMore || usingFallback) return;
    fetchingRef.current = true;

    const offset = offsetRef.current;
    setLoadingMore(true);

    fetchChunk(offset).then((chunk) => {
      if (!mounted.current) { fetchingRef.current = false; return; }
      if (process.env.NODE_ENV === "development") {
        console.log(`[PlanetsProvider] ✓ Loaded ${chunk.planets.length} more (offset ${offset})`);
      }
      setPlanets((prev) => {
        // Deduplicate by ID — guards against any server-side overlap between chunks
        const seen = new Set(prev.map((p) => p.id));
        const fresh = chunk.planets.filter((p) => !seen.has(p.id));
        const next = [...prev, ...fresh];
        offsetRef.current = next.length;
        lsWrite(next, chunk.total);
        return next;
      });
      setHasMore(chunk.hasMore);
      setLoadingMore(false);
      fetchingRef.current = false;
    }).catch((err) => {
      if (!mounted.current) { fetchingRef.current = false; return; }
      setError(`Could not load more planets: ${err.message}`);
      setLoadingMore(false);
      fetchingRef.current = false;
    });
  }, [hasMore, loadingMore, usingFallback]);

  const refetch = useCallback(() => setGeneration((g) => g + 1), []);

  return (
    <Ctx.Provider value={{
      planets, total, hasMore, loading, loadingMore,
      error, usingFallback, source, lastUpdated,
      loadMore, refetch,
    }}>
      {children}
    </Ctx.Provider>
  );
}
