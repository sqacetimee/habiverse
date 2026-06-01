# Exoplanet Explorer

A portfolio-grade, full-stack-style interactive dashboard for exploring confirmed exoplanets using real data from the NASA Exoplanet Archive. Built with Next.js 15, TypeScript, Tailwind CSS, and Recharts.

---

## Features

- **Real NASA data** — Live queries to the NASA Exoplanet Archive TAP API (pscomppars table)
- **Habitability scoring** — Simplified 0–100 score comparing radius, mass, temperature, and orbital period to Earth
- **Planet explorer** — Search, filter, sort, and browse thousands of confirmed exoplanets
- **Planet detail pages** — Full stats, radar chart, plain-English analysis, and similar planet suggestions
- **Interactive statistics** — Distribution charts for radius, orbital period, discovery year, detection method, and habitability
- **Data quality metrics** — Per-field completeness rates with explanations of why astronomical data is often incomplete
- **Favorites** — Save planets to a local favorites list using localStorage
- **Fallback dataset** — 20 well-known curated exoplanets if the NASA API is unavailable
- **Responsive design** — Works on mobile, tablet, and desktop
- **Dark space aesthetic** — Animated star background, glassmorphism cards, glow accents, orbit animations

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Charts | Recharts 2 |
| Icons | lucide-react |
| Animation | CSS animations + framer-motion |
| Data source | NASA Exoplanet Archive TAP API |
| Deployment | Vercel-ready |

---

## Data Source

All planet data is fetched from the [NASA Exoplanet Archive](https://exoplanetarchive.ipac.caltech.edu/) using the TAP (Table Access Protocol) API:

```
https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=ENCODED_SQL&format=json
```

**Table used:** `pscomppars` (Planetary Systems Composite Parameters)

This table provides one row per confirmed planet using the best available parameters from the literature. It is ideal for population-level statistics, though individual planet values may come from different sources and may not always be self-consistent.

**Columns fetched:**

| NASA Column | App Field | Description |
|---|---|---|
| `pl_name` | `name` | Planet name |
| `hostname` | `hostStar` | Host star name |
| `disc_year` | `discoveryYear` | Year of discovery |
| `discoverymethod` | `discoveryMethod` | Detection technique |
| `pl_rade` | `radiusEarth` | Planet radius (Earth radii) |
| `pl_bmasse` | `massEarth` | Planet mass (Earth masses) |
| `pl_orbper` | `orbitalPeriodDays` | Orbital period (days) |
| `pl_eqt` | `equilibriumTempK` | Equilibrium temperature (Kelvin) |
| `sy_dist` | `distanceParsecs` | Distance (parsecs) |

---

## Habitability Score

The habitability score is a **simplified 0–100 educational estimate**, not a scientific measurement of actual habitability.

### Formula

```
similarity(value, ideal, tolerance) = clamp(1 − |value − ideal| / tolerance, 0, 1)

score =
  radius_similarity × 0.25  (ideal: 1 R⊕, tolerance: 2.5)
  + mass_similarity × 0.25  (ideal: 1 M⊕, tolerance: 8)
  + temp_similarity × 0.30  (ideal: 288 K, tolerance: 150)
  + orbit_similarity × 0.15 (ideal: 365 days, tolerance: 500)
  + data_confidence × 0.05

final = round(score × 100)  [0–100]
```

### Missing Data

Missing values apply a neutral penalty rather than zero:
- Radius missing → 0.35
- Mass missing → 0.40 (very common in transit-only detections)
- Temperature missing → 0.30
- Orbital period missing → 0.35

### Disclaimer

This score is a simplified statistical estimate for educational exploration. Real habitability depends on atmospheric composition, stellar type, magnetic field, geology, and many other unmeasured factors.

---

## Data Confidence Score

The data confidence score (0–100%) measures what fraction of key fields are present for each planet:

- Radius
- Mass
- Orbital period
- Equilibrium temperature
- Distance
- Discovery method

A planet with all six fields present scores 100%.

---

## Installation

```bash
git clone <repo>
cd exoplanet-explorer
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Requirements

- Node.js 18+
- npm 9+
- Internet connection (for NASA API calls)

---

## Pages

| Route | Description |
|---|---|
| `/` | Landing page with hero, live stats, and feature overview |
| `/explore` | Full planet explorer with search, filters, and sorting |
| `/planets/[id]` | Individual planet detail page with radar chart and analysis |
| `/stats` | Statistics dashboard with 6 interactive charts |
| `/model` | Habitability model explanation and top-ranked planets |
| `/data` | Data quality metrics and field completeness breakdown |

---

## Future Improvements

- **Backend caching** — Cache NASA API responses to reduce load and improve speed
- **PostgreSQL database** — Store and update planet data on a server-side schedule
- **Nightly refresh jobs** — Automatically pull fresh data from NASA on a cron schedule
- **ML clustering** — Use unsupervised clustering to group similar planets
- **PCA visualization** — 2D scatter plot of planets in reduced parameter space
- **Star system pages** — View all planets orbiting the same host star
- **Multi-planet comparison** — Side-by-side comparison of 2–4 planets
- **Authentication** — Save favorites and notes across devices
- **Exportable data** — Download filtered planet lists as CSV

---

## License

For educational and portfolio purposes. Data © NASA Exoplanet Archive.
