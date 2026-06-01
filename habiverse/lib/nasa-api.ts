import type { Planet } from "./types";
import { calculateHabitabilityScore, calculateDataConfidence } from "./habitability";
import { slugifyPlanetName, toNumberOrNull } from "./utils";

const NASA_TAP_ENDPOINT = "https://exoplanetarchive.ipac.caltech.edu/TAP/sync";

const QUERY = `SELECT pl_name,hostname,disc_year,discoverymethod,pl_rade,pl_bmasse,pl_orbper,pl_eqt,sy_dist,st_teff FROM pscomppars WHERE pl_name IS NOT NULL ORDER BY disc_year DESC`;

interface NasaRow {
  pl_name: string;
  hostname: string | null;
  disc_year: number | null;
  discoverymethod: string | null;
  pl_rade: number | null;
  pl_bmasse: number | null;
  pl_orbper: number | null;
  pl_eqt: number | null;
  sy_dist: number | null;
  st_teff: number | null;
}

function transformRow(row: NasaRow, index: number): Planet {
  const distParsecs = toNumberOrNull(row.sy_dist);
  const core = {
    name: row.pl_name ?? `Unknown Planet ${index}`,
    hostStar: row.hostname ?? null,
    stellarTeff: toNumberOrNull(row.st_teff),
    radiusEarth: toNumberOrNull(row.pl_rade),
    massEarth: toNumberOrNull(row.pl_bmasse),
    orbitalPeriodDays: toNumberOrNull(row.pl_orbper),
    equilibriumTempK: toNumberOrNull(row.pl_eqt),
    discoveryYear: toNumberOrNull(row.disc_year),
    discoveryMethod: row.discoverymethod ?? null,
    distanceParsecs: distParsecs,
    distanceLightYears: distParsecs !== null ? distParsecs * 3.26156 : null,
  };
  return {
    id: slugifyPlanetName(core.name, index),
    ...core,
    habitabilityScore: calculateHabitabilityScore(core),
    dataConfidence: calculateDataConfidence(core),
  };
}

export async function fetchExoplanets(): Promise<Planet[]> {
  const url =
    `${NASA_TAP_ENDPOINT}?query=${encodeURIComponent(QUERY)}&format=json`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      throw new Error(`NASA Exoplanet Archive: HTTP ${res.status}`);
    }

    const raw: NasaRow[] = await res.json();
    if (!Array.isArray(raw)) {
      throw new Error("Unexpected response format from NASA Exoplanet Archive");
    }
    return raw.map((row, i) => transformRow(row, i));
  } finally {
    clearTimeout(timer);
  }
}
