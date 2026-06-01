import type { Planet, SortKey, FilterState } from "./types";
import { getStellarClass } from "./habitability";

export function slugifyPlanetName(name: string, index: number): string {
  return name
    ? name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
    : `planet-${index}`;
}

/**
 * Ensures every planet has a unique `id` after slug generation.
 * NASA's archive sometimes lists the same planet under two slightly
 * different name variants (e.g. "GJ 887 e" and "GJ-887 e") that both
 * collapse to the same slug. Duplicates get a numeric suffix: -2, -3…
 */
export function deduplicateIds(planets: Planet[]): Planet[] {
  const seen = new Map<string, number>();
  return planets.map((p) => {
    const prev = seen.get(p.id) ?? 0;
    seen.set(p.id, prev + 1);
    if (prev === 0) return p;
    return { ...p, id: `${p.id}-${prev + 1}` };
  });
}

export function toNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

export function formatNumber(
  value: number | null,
  decimals = 2,
  fallback = "N/A"
): string {
  if (value === null || value === undefined) return fallback;
  return value.toFixed(decimals);
}

export function formatDistance(
  parsecs: number | null,
  lightYears: number | null
): string {
  if (lightYears !== null) return `${lightYears.toFixed(1)} ly`;
  if (parsecs !== null) return `${parsecs.toFixed(1)} pc`;
  return "N/A";
}

export function formatTemp(tempK: number | null): string {
  if (tempK === null) return "N/A";
  const celsius = tempK - 273.15;
  return `${tempK.toFixed(0)} K (${celsius.toFixed(0)}°C)`;
}

export function getScoreColor(score: number): string {
  if (score >= 70) return "#22c55e";
  if (score >= 50) return "#84cc16";
  if (score >= 35) return "#eab308";
  if (score >= 20) return "#f97316";
  return "#ef4444";
}

export function getScoreLabel(score: number): string {
  if (score >= 70) return "High";
  if (score >= 50) return "Moderate";
  if (score >= 35) return "Low";
  if (score >= 20) return "Very Low";
  return "Minimal";
}

export function getConfidenceColor(confidence: number): string {
  if (confidence >= 80) return "#22c55e";
  if (confidence >= 60) return "#84cc16";
  if (confidence >= 40) return "#eab308";
  return "#f97316";
}

export function getPlanetColor(planet: Planet): string {
  const t = planet.equilibriumTempK;
  if (t === null) return "#6366f1";
  if (t > 1000) return "#f97316";
  if (t > 500) return "#eab308";
  if (t > 350) return "#ef4444";
  if (t > 250) return "#22c55e";
  if (t > 150) return "#3b82f6";
  return "#8b5cf6";
}

export function getPlanetSizeScale(radiusEarth: number | null): number {
  if (radiusEarth === null) return 1;
  return Math.min(Math.max(radiusEarth, 0.3), 15);
}

export function sortPlanets(planets: Planet[], sortKey: SortKey): Planet[] {
  const sorted = [...planets];
  switch (sortKey) {
    case "habitability":
      return sorted.sort((a, b) => b.habitabilityScore - a.habitabilityScore);
    case "habitability_asc":
      return sorted.sort((a, b) => a.habitabilityScore - b.habitabilityScore);
    case "confidence":
      return sorted.sort((a, b) => b.dataConfidence - a.dataConfidence);
    case "radius_desc":
      return sorted.sort(
        (a, b) => (b.radiusEarth ?? -1) - (a.radiusEarth ?? -1)
      );
    case "radius_asc":
      return sorted.sort(
        (a, b) => (a.radiusEarth ?? Infinity) - (b.radiusEarth ?? Infinity)
      );
    case "period_asc":
      return sorted.sort(
        (a, b) =>
          (a.orbitalPeriodDays ?? Infinity) - (b.orbitalPeriodDays ?? Infinity)
      );
    case "period_desc":
      return sorted.sort(
        (a, b) => (b.orbitalPeriodDays ?? -1) - (a.orbitalPeriodDays ?? -1)
      );
    case "year_desc":
      return sorted.sort(
        (a, b) => (b.discoveryYear ?? 0) - (a.discoveryYear ?? 0)
      );
    case "year_asc":
      return sorted.sort(
        (a, b) => (a.discoveryYear ?? 9999) - (b.discoveryYear ?? 9999)
      );
    case "distance_asc":
      return sorted.sort(
        (a, b) =>
          (a.distanceParsecs ?? Infinity) - (b.distanceParsecs ?? Infinity)
      );
    default:
      return sorted;
  }
}

export function filterPlanets(
  planets: Planet[],
  filters: FilterState,
  favorites: Set<string>
): Planet[] {
  return planets.filter((p) => {
    if (filters.showFavoritesOnly && !favorites.has(p.id)) return false;

    const search = filters.search.toLowerCase();
    if (
      search &&
      !p.name.toLowerCase().includes(search) &&
      !(p.hostStar ?? "").toLowerCase().includes(search)
    ) {
      return false;
    }

    if (filters.radiusMin && (p.radiusEarth ?? 0) < parseFloat(filters.radiusMin)) return false;
    if (filters.radiusMax && (p.radiusEarth ?? Infinity) > parseFloat(filters.radiusMax)) return false;
    if (filters.massMin && (p.massEarth ?? 0) < parseFloat(filters.massMin)) return false;
    if (filters.massMax && (p.massEarth ?? Infinity) > parseFloat(filters.massMax)) return false;
    if (filters.orbitalPeriodMin && (p.orbitalPeriodDays ?? 0) < parseFloat(filters.orbitalPeriodMin)) return false;
    if (filters.orbitalPeriodMax && (p.orbitalPeriodDays ?? Infinity) > parseFloat(filters.orbitalPeriodMax)) return false;
    if (filters.tempMin && (p.equilibriumTempK ?? 0) < parseFloat(filters.tempMin)) return false;
    if (filters.tempMax && (p.equilibriumTempK ?? Infinity) > parseFloat(filters.tempMax)) return false;
    if (filters.discoveryMethod && p.discoveryMethod !== filters.discoveryMethod) return false;
    if (filters.habitabilityMin && p.habitabilityScore < parseFloat(filters.habitabilityMin)) return false;
    if (filters.confidenceMin && p.dataConfidence < parseFloat(filters.confidenceMin)) return false;

    return true;
  });
}

export function getPlanetInsightText(planet: Planet): string {
  const parts: string[] = [];

  // Radius
  if (planet.radiusEarth !== null) {
    const r = planet.radiusEarth;
    if (r < 0.8) {
      parts.push(`At ${r.toFixed(2)} Earth radii, ${planet.name} is smaller than Earth. Smaller rocky worlds can have thinner atmospheres and weaker magnetic fields, which affects long-term habitability.`);
    } else if (r <= 1.25) {
      parts.push(`${planet.name} has a radius of ${r.toFixed(2)} Earth radii, putting it squarely in rocky-planet territory. Planets in this size range are the best candidates for solid surfaces and Earth-like geology.`);
    } else if (r <= 1.75) {
      parts.push(`At ${r.toFixed(2)} Earth radii, this planet sits in a transitional zone between rocky super-Earths and volatile-rich mini-Neptunes. Whether it has a solid surface or a thick gas envelope depends heavily on its mass and formation history.`);
    } else if (r <= 4.0) {
      parts.push(`With a radius of ${r.toFixed(2)} Earth radii, ${planet.name} is likely a sub-Neptune or mini-Neptune. Planets this size tend to retain large hydrogen and helium atmospheres, making a habitable surface unlikely under current models.`);
    } else {
      parts.push(`${planet.name} has a radius of ${r.toFixed(2)} Earth radii, firmly in gas giant territory. Surface habitability as we understand it is not expected, though some speculate about habitable moons around planets of this size.`);
    }
  } else {
    parts.push(`No radius measurement is available for ${planet.name}. This is common for planets discovered via radial velocity, where the stellar wobble reveals mass but not size.`);
  }

  // Mass
  if (planet.massEarth !== null) {
    const m = planet.massEarth;
    if (m < 0.5) {
      parts.push(`Its mass is ${m.toFixed(2)} times Earth's. That low gravity raises questions about whether the planet can retain a substantial atmosphere over geological timescales.`);
    } else if (m <= 2.0) {
      parts.push(`Its measured mass of ${m.toFixed(2)} Earth masses is consistent with a rocky, terrestrial composition, similar to Earth and Venus.`);
    } else if (m <= 10.0) {
      parts.push(`At ${m.toFixed(2)} Earth masses, this is a super-Earth. Planets in this mass range may be rocky or have significant water and ice layers, but their higher gravity also means thicker atmospheres.`);
    } else if (m <= 50.0) {
      parts.push(`The mass of ${m.toFixed(0)} Earth masses places ${planet.name} in the Neptune-class range. Planets this massive typically accumulate gas during formation, reducing the likelihood of a rocky surface.`);
    } else {
      parts.push(`At ${m.toFixed(0)} Earth masses, ${planet.name} is a gas giant. Its strong gravity and deep atmosphere make surface conditions very different from anything Earth-like.`);
    }
  } else {
    parts.push(`Mass data has not been measured for this planet. Transit detections give us the radius but not the mass, so we cannot determine whether the interior is rocky or gas-rich without follow-up radial velocity observations.`);
  }

  // Temperature
  if (planet.equilibriumTempK !== null) {
    const t = planet.equilibriumTempK;
    const tc = Math.round(t - 273.15);
    if (t < 150) {
      parts.push(`Its equilibrium temperature of ${Math.round(t)} K (${tc}°C) is extremely cold. At these temperatures, any surface water would be permanently frozen, and atmospheric gases like CO₂ may condense and collapse to the surface.`);
    } else if (t < 200) {
      parts.push(`An equilibrium temperature of ${Math.round(t)} K (${tc}°C) is colder than Mars at its warmest. Liquid water is almost certainly not present on the surface, though subsurface geothermal activity could still create habitable pockets.`);
    } else if (t < 240) {
      parts.push(`At ${Math.round(t)} K (${tc}°C), the equilibrium temperature is cool but within the plausible habitable zone. Earth's own equilibrium temperature is 255 K — with a similar greenhouse effect, surface temperatures could reach above freezing. The habitability score places this in the cool-but-viable range.`);
    } else if (t <= 270) {
      parts.push(`An equilibrium temperature of ${Math.round(t)} K (${tc}°C) is close to Earth's own equilibrium temperature of 255 K — this is the sweet spot our model scores highest. With an Earth-like greenhouse effect, the surface temperature would be near or above 0°C. This is one of the most favorable equilibrium temperatures for surface liquid water.`);
    } else if (t <= 320) {
      parts.push(`At ${Math.round(t)} K (${tc}°C), the planet is warmer than Earth's equilibrium temperature of 255 K, but still within the habitable zone. With an Earth-like greenhouse effect the surface could reach 50–80°C — hot but not necessarily fatal. The habitability score applies a modest penalty for the increased runaway-greenhouse risk at this temperature.`);
    } else if (t <= 500) {
      parts.push(`At ${Math.round(t)} K (${tc}°C), the planet runs significantly warmer than what Earth-like biology can tolerate under Earth-like pressure. Liquid water on the surface would require an unusually high atmospheric pressure, and runaway greenhouse feedback becomes a real risk.`);
    } else {
      parts.push(`The equilibrium temperature of ${Math.round(t)} K (${tc}°C) is well above the boiling point of water. Any surface liquid water would have evaporated long ago, and the planet is almost certainly uninhabitable at the surface.`);
    }
  } else {
    parts.push(`No equilibrium temperature has been published for ${planet.name}. Calculating this value requires precise knowledge of the host star's luminosity and the planet's albedo, which are not always available.`);
  }

  // Orbital period
  if (planet.orbitalPeriodDays !== null) {
    const p = planet.orbitalPeriodDays;
    if (p < 5) {
      parts.push(`${planet.name} completes an orbit every ${p.toFixed(1)} days, placing it extremely close to its star. At this distance, the planet likely receives intense radiation and may be tidally locked, keeping one hemisphere in permanent daylight.`);
    } else if (p < 20) {
      parts.push(`With an orbital period of ${p.toFixed(1)} days, the planet orbits much closer to its star than Mercury does to the Sun. Even around a cooler M-dwarf star, this proximity brings strong stellar flares and potential tidal locking into play.`);
    } else if (p < 100) {
      parts.push(`An orbital period of ${p.toFixed(0)} days puts this planet in a moderately close orbit. Whether this falls inside the habitable zone depends on the luminosity of the host star, which is not shown here.`);
    } else if (p <= 500) {
      parts.push(`The orbital period of ${p.toFixed(0)} days is in the same general range as Earth's year. For a Sun-like star, this would place the planet within or near the habitable zone, though stellar type matters greatly.`);
    } else {
      parts.push(`At ${p.toFixed(0)} days per orbit, ${planet.name} is far from its host star. Unless the star is significantly more luminous than the Sun, surface temperatures at this distance are likely too cold for liquid water.`);
    }
  } else {
    parts.push(`The orbital period of ${planet.name} has not been determined. Without this, we cannot estimate its distance from the host star or assess its position within the stellar habitable zone.`);
  }

  // Stellar environment — ARM / cosmic-shoreline risk
  const t = planet.equilibriumTempK;
  const per = planet.orbitalPeriodDays;
  const inHZ = t !== null && t >= 190 && t <= 380;
  if (inHZ) {
    if (planet.stellarTeff != null) {  // != catches both null and undefined (stale cache)
      const teff = planet.stellarTeff;
      const stellarClass = getStellarClass(teff);
      if (teff < 3200) {
        parts.push(`The host star is a ${stellarClass} (${teff.toFixed(0)} K) — among the most XUV-active stellar types known. Late M-dwarfs emit 6–8× more extreme-ultraviolet radiation per unit bolometric flux than the Sun, and their flare rates remain high for billions of years. This creates severe atmosphere-stripping risk even for planets in the habitable zone. The Atmosphere Retention Metric (ARM) applies a significant penalty to the habitability score.`);
      } else if (teff < 4000) {
        parts.push(`The host star is an early-to-mid ${stellarClass} (${teff.toFixed(0)} K). These stars emit 4–5× more XUV than the Sun relative to their total luminosity, and their habitable zones are very close in, raising tidal lock and flare risk. The ARM calculation places this planet near or below the cosmic shoreline — the boundary above which planets tend to retain their atmospheres. The score includes a moderate–significant stellar-environment penalty.`);
      } else if (teff < 5200) {
        parts.push(`The host star is a ${stellarClass} (${teff.toFixed(0)} K) — significantly calmer than M-dwarfs, with XUV fluxes only ~1.2–1.8× the Sun's. K-dwarfs represent a "sweet spot": long-lived, stable, and with habitable zones at orbital periods where tidal locking is unlikely. The ARM score for this planet is moderately positive, meaning atmospheric retention is favoured but not guaranteed.`);
      } else if (teff < 7500) {
        parts.push(`The host star is a ${stellarClass} (${teff.toFixed(0)} K) — similar in character to the Sun. G-dwarfs emit near-baseline XUV levels (≈1×), and ${planet.name} lies above the cosmic shoreline (positive ARM), meaning atmosphere retention is strongly favoured. This is one of the most benign stellar environments for long-term planetary habitability.`);
      } else {
        parts.push(`The host star is a ${stellarClass} (${teff.toFixed(0)} K). Hotter stars evolve quickly off the main sequence, leaving a narrower window for life to emerge. Their habitable zones shift inward rapidly as the star brightens. The ARM for this planet is positive due to relatively lower sustained XUV activity, but the shorter stellar lifetime is a separate concern not captured in this score.`);
      }
    } else if (per !== null) {
      // Fallback to period proxy when Teff not available
      if (per < 15) {
        parts.push(`A ${per.toFixed(1)}-day orbital period in the habitable temperature range is a strong indicator of an M-dwarf host star. M-dwarfs are notorious for violent stellar flares and coronal mass ejections that can strip a planetary atmosphere entirely. The score reflects a significant stellar environment penalty.`);
      } else if (per < 50) {
        parts.push(`The ${per.toFixed(1)}-day orbital period within a habitable temperature suggests this planet likely orbits an M-dwarf — a cool, dim star whose habitable zone is very close-in. M-dwarfs can be highly active, emitting flares that erode atmospheres over time.`);
      } else if (per < 100) {
        parts.push(`At ${per.toFixed(1)} days, this planet's period is consistent with a K-dwarf or outer M-dwarf host. Stellar flare risk is reduced compared to shorter-period habitable-zone planets, though not negligible.`);
      } else {
        parts.push(`An orbital period of ${per.toFixed(1)} days in a habitable temperature range points to a K- or G-dwarf host — stars that are far less flare-active than M-dwarfs. This is a favourable indicator for long-term atmospheric stability.`);
      }
    }
  }

  // Data confidence
  const conf = planet.dataConfidence;
  if (conf >= 80) {
    parts.push(`This assessment is based on solid data: ${conf}% of the key physical parameters have been measured, giving reasonable confidence in the habitability estimate.`);
  } else if (conf >= 50) {
    parts.push(`The habitability score carries some uncertainty. Only ${conf}% of the key parameters are measured, so the estimate would shift if the missing data were obtained.`);
  } else {
    parts.push(`Treat this estimate cautiously. With only ${conf}% of key parameters measured, the habitability score is based heavily on default assumptions for the missing values.`);
  }

  return parts.join(" ");
}

export function getDiscoveryMethods(planets: Planet[]): string[] {
  const methods = new Set<string>();
  planets.forEach((p) => {
    if (p.discoveryMethod) methods.add(p.discoveryMethod);
  });
  return Array.from(methods).sort();
}
