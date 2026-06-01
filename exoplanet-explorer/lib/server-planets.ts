import { existsSync, readFileSync } from "fs";
import { join } from "path";
import type { Planet } from "./types";
import { fallbackPlanets } from "./fallback-data";

const FILE = join(process.cwd(), "public", "data", "planets.json");

export interface PlanetsResult {
  planets: Planet[];
  usingFallback: boolean;
}

/**
 * Reads the pre-generated planets.json from disk (synchronous, ~0 ms).
 * Called in the root Server Component layout so data is embedded in the
 * initial HTML — zero client-side fetch on any page.
 *
 * Falls back to the hardcoded 20-planet sample if the file is absent.
 * Data is regenerated each time `npm run dev` or `npm run build` is run
 * via the predev/prebuild script.
 */
export async function getServerPlanets(): Promise<PlanetsResult> {
  try {
    if (existsSync(FILE)) {
      const raw = readFileSync(FILE, "utf-8");
      const planets: Planet[] = JSON.parse(raw);
      if (Array.isArray(planets) && planets.length > 0) {
        return { planets, usingFallback: false };
      }
    }
  } catch (e) {
    console.warn("[server-planets] Could not read planets.json:", e);
  }

  console.warn("[server-planets] Falling back to hardcoded dataset.");
  return { planets: fallbackPlanets, usingFallback: true };
}
