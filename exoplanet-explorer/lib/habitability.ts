import type { Planet } from "./types";

export type PlanetCore = Omit<Planet, "id" | "habitabilityScore" | "dataConfidence">;

/* ── Interpolation helper ─────────────────────────────────────────────────────
   Piecewise-linear curve defined by [x, y] breakpoints.
   Allows non-symmetric, non-monotonic scoring curves calibrated to real
   planetary-science thresholds rather than simple distance-to-Earth.         */

function piecewise(val: number, pts: [number, number][]): number {
  if (val <= pts[0][0])                    return pts[0][1];
  if (val >= pts[pts.length - 1][0])      return pts[pts.length - 1][1];
  for (let i = 0; i < pts.length - 1; i++) {
    if (val <= pts[i + 1][0]) {
      const t = (val - pts[i][0]) / (pts[i + 1][0] - pts[i][0]);
      return pts[i][1] + t * (pts[i + 1][1] - pts[i][1]);
    }
  }
  return 0;
}

/* ── Sub-score 1: Planetary Radius (20 %)  ───────────────────────────────────
   Informed by the "radius gap" at ~1.8 R⊕ (Fulton et al. 2017), which
   separates rocky super-Earths from volatile-rich sub-Neptunes.
   Planets ≤ 1.6 R⊕ are statistically likely to be rocky.                    */

function scoreRadius(r: number | null): number {
  if (r === null) return 0.32;
  return piecewise(r, [
    [0.0,  0.00],
    [0.4,  0.20],
    [0.7,  0.65],
    [0.85, 0.85],
    [1.0,  1.00],   // Earth
    [1.25, 0.98],
    [1.6,  0.82],   // top of the rocky-world band
    [1.8,  0.45],   // radius gap — composition becomes uncertain
    [2.5,  0.22],   // sub-Neptune
    [4.0,  0.10],
    [8.0,  0.04],
    [20.0, 0.00],
  ]);
}

/* ── Sub-score 2: Surface Gravity (15 %) ─────────────────────────────────────
   Surface gravity g ∝ M / R² (Earth units).
   Too low → atmosphere escapes. Too high → crushing pressure on biochemistry.
   Sweet spot 0.4g–1.8g, peak at Earth (1.0g).                               */

function scoreGravity(r: number | null, m: number | null): number {
  if (r === null || m === null) return 0.38;
  const g = m / (r * r);    // g relative to Earth; Earth = 1.0
  return piecewise(g, [
    [0.00, 0.00],
    [0.20, 0.12],
    [0.40, 0.60],
    [0.65, 0.88],
    [1.00, 1.00],  // Earth
    [1.40, 0.92],
    [1.80, 0.74],
    [2.50, 0.48],
    [3.50, 0.22],
    [5.00, 0.08],
    [10.0, 0.00],
  ]);
}

/* ── Sub-score 3: Bulk Density Proxy (15 %) ──────────────────────────────────
   Relative density ∝ M / R³ (Earth = 1 → 5.51 g cm⁻³).
   Rocky planets cluster near 0.7–1.5×; sub-Neptunes at 0.05–0.35×.
   High density confirms a solid, potentially habitable surface.               */

function scoreDensity(r: number | null, m: number | null): number {
  if (r === null || m === null) return 0.38;
  const rho = m / (r * r * r);   // relative bulk density; Earth = 1
  return piecewise(rho, [
    [0.00, 0.00],
    [0.04, 0.05],
    [0.10, 0.15],
    [0.25, 0.28],
    [0.45, 0.52],
    [0.70, 0.82],
    [1.00, 1.00],  // Earth density
    [1.30, 0.94],
    [1.70, 0.80],
    [2.50, 0.58],
    [4.50, 0.28],
    [8.00, 0.10],
    [15.0, 0.00],
  ]);
}

/* ── Sub-score 4: Thermal Habitability (28 %) ────────────────────────────────
   Equilibrium temperature is the single strongest predictor of surface
   liquid-water potential. The curve peaks at Earth's actual equilibrium
   temperature of 255 K (not the 288 K surface temperature, which includes
   a 33 K greenhouse offset). This means planets like Kepler-442 b at 241 K
   score high — with an Earth-like greenhouse effect their surfaces would be
   ~274 K, well above freezing. Planets warmer than ~300 K equilibrium carry
   increasing runaway-greenhouse risk at Earth-like pressures.

   Key thresholds:
   – Below 150 K  : permanent CO₂ atmospheric collapse probable
   – 195–230 K    : cold; subsurface liquid water possible via geothermal
   – 240–265 K    : near-optimal — ~Earth's equilibrium zone
   – 265–300 K    : warm, still habitable with moderate greenhouse
   – Above 350 K  : runaway greenhouse risk escalates rapidly
   – Above 500 K  : Venus-like; surface water cannot exist                    */

function scoreThermal(t: number | null): number {
  if (t === null) return 0.28;
  return piecewise(t, [
    [0,   0.00],
    [80,  0.03],
    [150, 0.12],
    [195, 0.42],
    [225, 0.80],
    [245, 0.95],
    [255, 1.00],   // Earth's equilibrium temperature (Teq = 255 K)
    [265, 0.98],
    [280, 0.92],
    [300, 0.83],
    [325, 0.68],
    [355, 0.48],
    [395, 0.24],
    [450, 0.10],
    [600, 0.02],
    [900, 0.00],
  ]);
}

/* ── Sub-score 5: Orbital Period & Tidal-Lock Risk (12 %) ───────────────────
   Period proxies stellar distance. Key thresholds:
   – < 5 d   : very likely tidally locked (synchronous rotation), one hemisphere
               in permanent daylight, one in permanent darkness
   – 5–20 d  : M-dwarf habitable zone; possible if atmosphere redistributes heat
   – 20–100 d: inner HZ for K/M dwarfs; outer HZ for Sun-like not yet confirmed
   – 200–600 d: Earth-Sun analogue sweet spot
   – > 1500 d : likely too cold for liquid water unless high-luminosity host star
   Cross-consistency bonus: if temperature AND period both land in habitable
   ranges they reinforce each other.                                            */

function scoreOrbital(period: number | null, tempK: number | null): number {
  if (period === null) return 0.34;
  let s = piecewise(period, [
    [0.0,  0.00],
    [1.0,  0.02],
    [3.0,  0.08],
    [5.0,  0.16],
    [12.0, 0.38],
    [25.0, 0.58],
    [60.0, 0.78],
    [150,  0.92],
    [300,  0.99],
    [500,  1.00],  // Earth's period sits here
    [700,  0.95],
    [1200, 0.78],
    [2000, 0.52],
    [4000, 0.20],
    [8000, 0.05],
    [20000,0.00],
  ]);
  // Thermal cross-consistency bonus (+8 % if both T and P are in habitable ranges)
  if (tempK !== null && tempK >= 210 && tempK <= 360 && period >= 10 && period <= 700) {
    s = Math.min(1.0, s * 1.08);
  }
  return s;
}

/* ── Sub-score 6: Atmospheric Retention Potential (10 %) ────────────────────
   Simplified Jeans escape: molecules escape when thermal velocity exceeds
   escape velocity. The ratio g/T approximates retention ability.
   High gravity + low temperature = better atmosphere retention.
   Earth: g=1, T=288 K → ratio ≈ 1.0 (normalised).                           */

function scoreAtmoRetention(r: number | null, m: number | null, t: number | null): number {
  if (r === null || m === null || t === null) return 0.36;
  const g        = m / (r * r);
  const tNorm    = t / 288;         // normalise to Earth equilibrium temp
  const jeans    = g / tNorm;       // Earth = 1.0; higher = better retention
  return piecewise(jeans, [
    [0.00, 0.00],
    [0.08, 0.05],
    [0.20, 0.22],
    [0.40, 0.52],
    [0.65, 0.78],
    [0.90, 0.94],
    [1.00, 1.00],  // Earth
    [1.40, 0.95],
    [2.00, 0.86],
    [4.00, 0.74],
    [8.00, 0.60],
  ]);
}

/* ── Atmosphere Retention Metric (ARM) / Cosmic Shoreline ───────────────────
   Based on Zahnle & Catling (2017): planets above the cosmic shoreline in
   log(v_esc) vs log(F_XUV) space retain their atmospheres; below it, XUV
   photoionisation and stellar wind erosion strip atmospheres over Gyr.

   ARM = log₁₀(v_esc_rel) − 0.25 × log₁₀(F_XUV_rel)

   where:
   · v_esc_rel = √(M/R)  [Earth = 1]  (escape velocity scales as √(M/R))
   · F_XUV_rel = getXuvFactor(T_eff)  [relative XUV flux vs Sun-analogue]

   XUV factors embed the paper's key correction: mid-to-late M-dwarfs emit
   2.1–3.1× more XUV/EUV relative to their bolometric luminosity than
   canonical GJ/Sun-like scaling predicts, due to their sustained magnetic
   activity over Gyr timescales.  Early M-dwarfs (3600–4000 K) still emit
   4–5× more XUV than a Sun-like star; K-dwarfs (4000–5200 K) are
   significantly calmer, dropping to ~1.2–1.8× Sun.                           */

function getXuvFactor(teff: number): number {
  // Relative XUV flux compared to a Sun-like (G2V, Teff ≈ 5500 K) star.
  // Sharp drop at the M/K boundary (~4000–4200 K) reflects the dramatically
  // lower flare frequency and saturated XUV emission of K-dwarfs vs M-dwarfs.
  return piecewise(teff, [
    [2000, 8.0],   // ultracool dwarf (TRAPPIST-1 type, ~M8–M9)
    [2600, 7.0],   // very late M (~M6–M7)
    [3000, 6.0],   // late M (~M4–M5)
    [3400, 5.0],   // mid M (~M3)
    [3800, 4.5],   // early M (~M1–M2, e.g. Kepler-438 host at 3748 K)
    [4000, 4.0],   // M0 / K7 boundary
    [4200, 1.8],   // K7 — large drop at M→K transition
    [4800, 1.2],   // mid K (~K2–K3, e.g. Kepler-442 host at 4402 K → ~1.5)
    [5200, 1.0],   // G/K boundary — Sun-like XUV baseline
    [6000, 1.0],   // G-dwarf (G0–G9)
    [7000, 0.9],   // F-dwarf (less saturated, older when HZ)
    [9000, 0.8],
  ]);
}

function computeARM(r: number | null, m: number | null, teff: number): number {
  // Returns the Atmosphere Retention Metric.
  // Positive → above cosmic shoreline (retains atmosphere).
  // Negative → below shoreline (at risk of atmospheric stripping).
  if (r === null || m === null || r <= 0 || m <= 0) return 0.0;
  const vEscRel   = Math.sqrt(m / r);
  const xuvFactor = getXuvFactor(teff);
  return Math.log10(vEscRel) - 0.25 * Math.log10(xuvFactor);
}

function armToMultiplier(arm: number): number {
  return piecewise(arm, [
    [-0.80, 0.25],   // deeply below shoreline — atmosphere likely stripped
    [-0.50, 0.42],
    [-0.25, 0.60],
    [-0.15, 0.70],
    [-0.05, 0.80],
    [ 0.00, 0.86],   // right on the cosmic shoreline — highly uncertain
    [ 0.05, 0.93],
    [ 0.15, 0.98],
    [ 0.30, 1.00],   // safely above shoreline — atmosphere retention favoured
    [ 0.50, 1.00],
  ]);
}

/* ── Data confidence ─────────────────────────────────────────────────────────
   Weighted by field importance to the habitability calculation.
   Temperature and radius are the most diagnostic; mass adds density context.  */

export function calculateDataConfidence(planet: PlanetCore): number {
  const weights = [
    { val: planet.equilibriumTempK,   w: 2.0 },  // most important
    { val: planet.radiusEarth,        w: 2.0 },  // second most
    { val: planet.massEarth,          w: 1.5 },  // enables density/gravity
    { val: planet.orbitalPeriodDays,  w: 1.0 },
    { val: planet.distanceParsecs,    w: 0.5 },
    { val: planet.discoveryMethod,    w: 0.5 },  // least diagnostic for habitability
  ];
  const total   = weights.reduce((s, f) => s + f.w, 0);
  const present = weights.reduce((s, f) => s + (f.val !== null && f.val !== undefined ? f.w : 0), 0);
  return Math.round((present / total) * 100);
}

/* ── Stellar classification helper ──────────────────────────────────────────
   Returns a human-readable spectral class label from effective temperature.  */

export function getStellarClass(teff: number | null): string {
  if (teff === null) return "Unknown";
  if (teff < 2400)  return "Y-dwarf";
  if (teff < 2800)  return "Very late M-dwarf";
  if (teff < 3200)  return "Late M-dwarf";
  if (teff < 3600)  return "Mid M-dwarf";
  if (teff < 4000)  return "Early M-dwarf";
  if (teff < 5200)  return "K-dwarf";
  if (teff < 6000)  return "G-dwarf";
  if (teff < 7500)  return "F-dwarf";
  if (teff < 10000) return "A-star";
  return "Hot star";
}

/* ── Master habitability score (0–100) ───────────────────────────────────────
   Six independent sub-scores capture distinct habitability dimensions.
   Two non-linear multipliers apply after weighting:

   Multiplier 1 — Temperature extremes:
     No amount of good radius or gravity saves a 900 K or 40 K planet.

   Multiplier 2 — Stellar environment / Atmosphere Retention Metric (ARM):
     When stellar effective temperature is available, the ARM is computed from
     the cosmic shoreline framework (Zahnle & Catling 2017). When Teff is
     absent, orbital period serves as a proxy for host-star luminosity class.
     The ARM encodes whether XUV photoionisation can strip the atmosphere
     over geological time — the dominant risk factor for M-dwarf HZ planets.  */

export function calculateHabitabilityScore(planet: PlanetCore): number {
  const conf     = calculateDataConfidence(planet) / 100;

  const sRadius  = scoreRadius(planet.radiusEarth);
  const sGravity = scoreGravity(planet.radiusEarth, planet.massEarth);
  const sDensity = scoreDensity(planet.radiusEarth, planet.massEarth);
  const sThermal = scoreThermal(planet.equilibriumTempK);
  const sOrbital = scoreOrbital(planet.orbitalPeriodDays, planet.equilibriumTempK);
  const sAtmo    = scoreAtmoRetention(planet.radiusEarth, planet.massEarth, planet.equilibriumTempK);

  const raw =
    sRadius  * 0.20 +
    sGravity * 0.15 +
    sDensity * 0.15 +
    sThermal * 0.28 +
    sOrbital * 0.12 +
    sAtmo    * 0.10;

  // Data confidence contributes its own 5 % to reward well-characterised planets
  const scored = raw * 0.95 + conf * 0.05;

  // ── Multiplier 1: temperature extremes ───────────────────────────────────
  const tempMultiplier = planet.equilibriumTempK !== null
    ? piecewise(planet.equilibriumTempK, [
        [0,   0.35], [80,  0.55], [150, 0.80],
        [200, 1.00], [400, 1.00],
        [500, 0.90], [650, 0.60], [900, 0.30], [1500, 0.10], [3000, 0.00],
      ])
    : 0.85;

  // ── Multiplier 2: stellar environment (ARM or period proxy) ──────────────
  // Only applied when the planet is in the habitable temperature range.
  // Outside the HZ the temperature multiplier already dominates.
  const t = planet.equilibriumTempK;
  const p = planet.orbitalPeriodDays;
  const inHZ = t !== null && t >= 190 && t <= 380;

  let stellarMultiplier = 1.0;
  if (inHZ) {
    if (planet.stellarTeff !== null) {
      // Real ARM from Zahnle & Catling (2017) cosmic shoreline
      const arm = computeARM(planet.radiusEarth, planet.massEarth, planet.stellarTeff);
      stellarMultiplier = armToMultiplier(arm);
    } else if (p !== null) {
      // Orbital-period proxy for host-star luminosity class (fallback)
      stellarMultiplier = piecewise(p, [
        [0,   0.48],   // P < 1 d  — extreme tidal lock, intense irradiation
        [3,   0.50],
        [8,   0.58],
        [15,  0.65],   // M-dwarf HZ inner edge — high flare probability
        [30,  0.74],   // Kepler-438 b range
        [50,  0.82],
        [80,  0.90],
        [110, 0.96],   // Kepler-442 b range — K-dwarf, much calmer
        [150, 0.99],
        [200, 1.00],   // G/K-dwarf HZ — benign stellar environment
        [600, 1.00],
        [2000,0.95],   // very long periods → very dim or distant star
      ]);
    }
  }

  return Math.max(0, Math.min(100,
    Math.round(scored * tempMultiplier * stellarMultiplier * 100)
  ));
}
