export interface Planet {
  id: string;
  name: string;
  hostStar: string | null;
  stellarTeff: number | null;
  radiusEarth: number | null;
  massEarth: number | null;
  orbitalPeriodDays: number | null;
  equilibriumTempK: number | null;
  discoveryYear: number | null;
  discoveryMethod: string | null;
  distanceParsecs: number | null;
  distanceLightYears: number | null;
  habitabilityScore: number;
  dataConfidence: number;
}

export interface FilterState {
  search: string;
  radiusMin: string;
  radiusMax: string;
  massMin: string;
  massMax: string;
  orbitalPeriodMin: string;
  orbitalPeriodMax: string;
  tempMin: string;
  tempMax: string;
  discoveryMethod: string;
  habitabilityMin: string;
  confidenceMin: string;
  showFavoritesOnly: boolean;
}

export type SortKey =
  | "habitability"
  | "habitability_asc"
  | "confidence"
  | "radius_desc"
  | "radius_asc"
  | "period_asc"
  | "period_desc"
  | "year_desc"
  | "year_asc"
  | "distance_asc";

export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface ExoplanetsState {
  planets: Planet[];
  loading: boolean;
  error: string | null;
  usingFallback: boolean;
  lastUpdated: Date | null;
}

/** Shape returned by /api/exoplanets?offset=N&limit=M */
export interface ChunkResponse {
  planets: Planet[];
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
  source: "nasa" | "file";
}
