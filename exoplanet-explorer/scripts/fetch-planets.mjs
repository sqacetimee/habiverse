/**
 * Pre-generates public/data/planets.json at build / dev start.
 * Run with: node --use-system-ca scripts/fetch-planets.mjs
 *
 * Skips the fetch if the file already exists and is less than 24 hours old.
 */

import { writeFileSync, mkdirSync, existsSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "public", "data");
const OUT_FILE = join(OUT_DIR, "planets.json");
const STALE_MS = 24 * 60 * 60 * 1000;

// ── Skip if fresh ─────────────────────────────────────────────
if (existsSync(OUT_FILE)) {
  const age = Date.now() - statSync(OUT_FILE).mtimeMs;
  if (age < STALE_MS) {
    const count = JSON.parse(
      (await import("fs")).readFileSync(OUT_FILE, "utf-8")
    ).length;
    console.log(`✓ planets.json is fresh (${count} planets, ${Math.round(age / 1000)}s old) — skipping fetch.`);
    process.exit(0);
  }
}

// ── NASA TAP query ────────────────────────────────────────────
const QUERY =
  "SELECT pl_name,hostname,disc_year,discoverymethod," +
  "pl_rade,pl_bmasse,pl_orbper,pl_eqt,sy_dist,st_teff " +
  "FROM pscomppars WHERE pl_name IS NOT NULL ORDER BY disc_year DESC";

const NASA_URL =
  "https://exoplanetarchive.ipac.caltech.edu/TAP/sync" +
  `?query=${encodeURIComponent(QUERY)}&format=json&MAXREC=5000`;

// ── Helpers ───────────────────────────────────────────────────
function toNum(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v); return Number.isFinite(n) ? n : null;
}
function slug(name, i) {
  return name ? name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"") : `planet-${i}`;
}

// Piecewise-linear scorer — mirrors lib/habitability.ts exactly
function pw(val, pts) {
  if (val <= pts[0][0]) return pts[0][1];
  if (val >= pts[pts.length-1][0]) return pts[pts.length-1][1];
  for (let i=0;i<pts.length-1;i++) {
    if (val<=pts[i+1][0]) {
      const t=(val-pts[i][0])/(pts[i+1][0]-pts[i][0]);
      return pts[i][1]+t*(pts[i+1][1]-pts[i][1]);
    }
  }
  return 0;
}

function scoreRadius(r) {
  if (r===null) return 0.32;
  return pw(r,[[0,0],[0.4,0.2],[0.7,0.65],[0.85,0.85],[1,1],[1.25,0.98],[1.6,0.82],[1.8,0.45],[2.5,0.22],[4,0.1],[8,0.04],[20,0]]);
}
function scoreGravity(r,m) {
  if (r===null||m===null) return 0.38;
  const g=m/(r*r);
  return pw(g,[[0,0],[0.2,0.12],[0.4,0.6],[0.65,0.88],[1,1],[1.4,0.92],[1.8,0.74],[2.5,0.48],[3.5,0.22],[5,0.08],[10,0]]);
}
function scoreDensity(r,m) {
  if (r===null||m===null) return 0.38;
  const rho=m/(r*r*r);
  return pw(rho,[[0,0],[0.04,0.05],[0.1,0.15],[0.25,0.28],[0.45,0.52],[0.7,0.82],[1,1],[1.3,0.94],[1.7,0.8],[2.5,0.58],[4.5,0.28],[8,0.1],[15,0]]);
}
function scoreThermal(t) {
  if (t===null) return 0.28;
  return pw(t,[[0,0],[80,0.03],[150,0.12],[195,0.42],[225,0.80],[245,0.95],[255,1],[265,0.98],[280,0.92],[300,0.83],[325,0.68],[355,0.48],[395,0.24],[450,0.10],[600,0.02],[900,0]]);
}
function scoreOrbital(period,tempK) {
  if (period===null) return 0.34;
  let s=pw(period,[[0,0],[1,0.02],[3,0.08],[5,0.16],[12,0.38],[25,0.58],[60,0.78],[150,0.92],[300,0.99],[500,1],[700,0.95],[1200,0.78],[2000,0.52],[4000,0.2],[8000,0.05],[20000,0]]);
  if (tempK!==null&&tempK>=210&&tempK<=360&&period>=10&&period<=700) s=Math.min(1,s*1.08);
  return s;
}
function scoreAtmo(r,m,t) {
  if (r===null||m===null||t===null) return 0.36;
  const g=m/(r*r), jeans=g/(t/288);
  return pw(jeans,[[0,0],[0.08,0.05],[0.2,0.22],[0.4,0.52],[0.65,0.78],[0.9,0.94],[1,1],[1.4,0.95],[2,0.86],[4,0.74],[8,0.6]]);
}

function confidence(p) {
  const w=[{v:p.equilibriumTempK,w:2},{v:p.radiusEarth,w:2},{v:p.massEarth,w:1.5},{v:p.orbitalPeriodDays,w:1},{v:p.distanceParsecs,w:0.5},{v:p.discoveryMethod,w:0.5}];
  const tot=w.reduce((s,f)=>s+f.w,0);
  const pres=w.reduce((s,f)=>s+(f.v!==null&&f.v!==undefined?f.w:0),0);
  return Math.round(pres/tot*100);
}

// ARM / Cosmic-Shoreline stellar multiplier (Zahnle & Catling 2017)
function getXuvFactor(teff) {
  return pw(teff,[
    [2000,8.0],[2600,7.0],[3000,6.0],[3400,5.0],
    [3800,4.5],[4000,4.0],[4200,1.8],[4800,1.2],
    [5200,1.0],[6000,1.0],[7000,0.9],[9000,0.8],
  ]);
}

function computeARM(r,m,teff) {
  if (r===null||m===null||r<=0||m<=0) return 0.0;
  const vEscRel=Math.sqrt(m/r);
  return Math.log10(vEscRel)-0.25*Math.log10(getXuvFactor(teff));
}

function armToMult(arm) {
  return pw(arm,[[-0.8,0.25],[-0.5,0.42],[-0.25,0.60],[-0.15,0.70],[-0.05,0.80],
    [0.0,0.86],[0.05,0.93],[0.15,0.98],[0.3,1.0],[0.5,1.0]]);
}

function stellarMult(p) {
  const t=p.equilibriumTempK, per=p.orbitalPeriodDays;
  const inHz=t!==null&&t>=190&&t<=380;
  if (!inHz) return 1.0;
  if (p.stellarTeff!==null) return armToMult(computeARM(p.radiusEarth,p.massEarth,p.stellarTeff));
  if (per===null) return 1.0;
  return pw(per,[[0,0.48],[3,0.50],[8,0.58],[15,0.65],[30,0.74],[50,0.82],[80,0.90],[110,0.96],[150,0.99],[200,1.0],[600,1.0],[2000,0.95]]);
}

function habitability(p) {
  const conf=confidence(p)/100;
  const raw=scoreRadius(p.radiusEarth)*0.20+scoreGravity(p.radiusEarth,p.massEarth)*0.15+scoreDensity(p.radiusEarth,p.massEarth)*0.15+scoreThermal(p.equilibriumTempK)*0.28+scoreOrbital(p.orbitalPeriodDays,p.equilibriumTempK)*0.12+scoreAtmo(p.radiusEarth,p.massEarth,p.equilibriumTempK)*0.10;
  const scored=raw*0.95+conf*0.05;
  const tMult=p.equilibriumTempK!==null?pw(p.equilibriumTempK,[[0,0.35],[80,0.55],[150,0.8],[200,1],[400,1],[500,0.9],[650,0.6],[900,0.3],[1500,0.1],[3000,0]]):0.85;
  return Math.max(0,Math.min(100,Math.round(scored*tMult*stellarMult(p)*100)));
}

function transform(row, i) {
  const dist = toNum(row.sy_dist);
  const p = {
    id: slug(row.pl_name, i),
    name: row.pl_name ?? `Unknown ${i}`,
    hostStar: row.hostname ?? null,
    stellarTeff: toNum(row.st_teff),
    radiusEarth: toNum(row.pl_rade),
    massEarth: toNum(row.pl_bmasse),
    orbitalPeriodDays: toNum(row.pl_orbper),
    equilibriumTempK: toNum(row.pl_eqt),
    discoveryYear: toNum(row.disc_year),
    discoveryMethod: row.discoverymethod ?? null,
    distanceParsecs: dist,
    distanceLightYears: dist !== null ? dist * 3.26156 : null,
    habitabilityScore: 0,
    dataConfidence: 0,
  };
  p.habitabilityScore = habitability(p);
  p.dataConfidence = confidence(p);
  return p;
}

// ── Fetch ─────────────────────────────────────────────────────
console.log("↓ Fetching NASA Exoplanet Archive (with st_teff)…");
const start = Date.now();

let raw;
try {
  const res = await fetch(NASA_URL, {
    signal: AbortSignal.timeout(25_000),
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${await res.text().then(t => t.slice(0, 200))}`);
  }
  raw = await res.json();
} catch (err) {
  console.error(`✗ Fetch failed: ${err.message}`);
  if (err.message.includes("SSL") || err.message.includes("certificate") || err.message.includes("fetch failed")) {
    console.error("  Tip: run with --use-system-ca (already set in npm run dev/build).");
  }
  if (existsSync(OUT_FILE)) {
    console.log("  ↩ Keeping existing planets.json — dev server will use it.");
    process.exit(0);
  }
  process.exit(1);
}

if (!Array.isArray(raw) || raw.length === 0) {
  console.error("✗ Unexpected response (not an array or empty)");
  process.exit(1);
}

// ── Transform & write ─────────────────────────────────────────
const planets = raw.map((row, i) => transform(row, i));
mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_FILE, JSON.stringify(planets));

const elapsed = ((Date.now() - start) / 1000).toFixed(1);
console.log(`✓ Wrote ${planets.length} planets → public/data/planets.json (${elapsed}s)`);

// Print top 5 for verification
const top5 = [...planets].sort((a,b)=>b.habitabilityScore-a.habitabilityScore).slice(0,5);
console.log("  Top 5 by habitability score:");
top5.forEach((p,i)=>console.log(`    ${i+1}. ${p.name} — score ${p.habitabilityScore} (Teff=${p.stellarTeff ?? "N/A"} K)`));
