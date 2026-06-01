# Habiverse

**Explore 5,000+ confirmed exoplanets using real NASA data — scored, ranked, and explained.**

[**Live demo →**](https://habiverse.vercel.app)

---

## What is Habiverse?

Habiverse is an interactive dashboard for the NASA Exoplanet Archive. Every confirmed exoplanet discovered so far — over 5,000 of them — is fetched live, scored for habitability, and presented with charts, comparisons, and plain-English explanations.

The name is a mashup of *habitable* and *universe*. The core question it tries to answer: **of all the worlds we've found, which ones could actually support life?**

---

## How the Habitability Score Works

Each planet gets a score from **0 to 100** based on six measurable factors from NASA's data:

| Factor | Weight | What it measures |
|---|---|---|
| Planetary Radius | 20% | Planets 0.85–1.6× Earth's radius are likely rocky with solid surfaces |
| Surface Gravity | 15% | Too weak → atmosphere escapes. Too strong → biology struggles |
| Bulk Density | 15% | High density (like Earth's 5.51 g/cm³) confirms a rocky interior |
| Equilibrium Temperature | 28% | Peaks at 255 K — Earth's own equilibrium temperature |
| Orbital Period | 12% | Very short orbits likely mean tidal locking (one side always dark) |
| Atmospheric Retention | 10% | Simplified Jeans escape: high gravity + low temperature = better atmosphere |

After the six sub-scores are weighted and summed, two multipliers are applied:

**Temperature hard cap** — no matter how good the other factors are, a planet at 900 K or 50 K cannot be habitable. This multiplier collapses the score for extreme temperatures regardless of anything else.

**Stellar environment multiplier (ARM)** — this is the most scientifically interesting part. It uses NASA's measured stellar effective temperature (`st_teff`) to compute the *Atmosphere Retention Metric* from Zahnle & Catling (2017):

```
ARM = log₁₀(v_escape) − 0.25 × log₁₀(F_XUV)
```

M-dwarf stars (dim red stars like TRAPPIST-1) emit 4–8× more extreme-ultraviolet radiation per unit of starlight than our Sun. This radiation strips planetary atmospheres over billions of years. Planets around M-dwarfs are penalised significantly even if they sit in the "habitable zone" — which is why Kepler-438b (radius and temperature almost identical to Earth, but orbiting an M-dwarf) scores 69, while Kepler-442b (orbiting a calmer K-dwarf) scores 89.

The word "habitable" is used loosely throughout astronomy. A score of 80+ here means a planet has Earth-like size, temperature, and a calm enough host star — not that humans could live there. Real habitability also depends on atmospheric composition, magnetic fields, plate tectonics, water, and many things we simply cannot measure for distant planets yet.

---

## Features

- **5,000 confirmed exoplanets** fetched live from the NASA Exoplanet Archive TAP API
- **Infinite scroll** — planets load in chunks of 100 as you scroll, so the page stays fast
- **Search and filter** by radius, mass, temperature, orbital period, discovery method, and more
- **Planet detail pages** — radar chart comparing each planet to Earth, plain-English analysis, host star classification, and score breakdown
- **Habitability model page** — simple explanation for general readers, full technical breakdown for those who want it
- **Statistics** — population charts for radius distribution, orbital periods, discovery methods, and discoveries by year
- **Data quality** — field completeness across all 5,000 planets (e.g. only 78% have equilibrium temperature data)
- **Stellar classification** — every planet shows its host star type (Late M-dwarf, K-dwarf, G-dwarf, etc.) based on measured effective temperature
- **Daily refresh** — planet data is automatically updated every day via a scheduled Vercel cron job

---

## Top Candidates

The current top-scoring planets according to the model:

| Rank | Planet | Score | Why |
|---|---|---|---|
| 1 | **Kepler-452 b** | 90 | G-dwarf host (Sun-like), 265 K equilibrium temp, 385-day year |
| 2 | **Kepler-442 b** | 89 | K-dwarf host (calm star), 241 K temp, 1.34× Earth radius |
| 3 | **Kepler-1126 c** | 88 | G-dwarf host, near-ideal 305 K temp, 200-day orbit |

Kepler-442b is frequently cited in the scientific literature as one of the most promising habitability candidates, partly because its K-dwarf host star lives longer than our Sun (~15–30 billion years vs ~10 billion), giving more time for life to develop.

---

## Data Source

All data comes from NASA's **Planetary Systems Composite Parameters** table (`pscomppars`) via the [Exoplanet Archive TAP API](https://exoplanetarchive.ipac.caltech.edu/). This table provides one composite row per confirmed planet using the best available measurements from the literature — ideal for population-level analysis.

Fields used:

| NASA Column | Description |
|---|---|
| `pl_name` | Planet name |
| `hostname` | Host star name |
| `st_teff` | Stellar effective temperature (K) — drives ARM scoring |
| `pl_rade` | Radius in Earth radii |
| `pl_bmasse` | Mass in Earth masses |
| `pl_orbper` | Orbital period in days |
| `pl_eqt` | Equilibrium temperature in Kelvin |
| `sy_dist` | Distance to system in parsecs |
| `disc_year` | Year of discovery |
| `discoverymethod` | Detection technique (transit, radial velocity, etc.) |

---

## Tech Stack

- **Next.js 15** (App Router) — server components, API routes, static generation
- **TypeScript** — end to end
- **Tailwind CSS v4** — utility styling
- **Recharts** — all data visualisation
- **NASA Exoplanet Archive TAP API** — live planet data
- **Vercel** — hosting, cron jobs for daily data refresh

---

## Running Locally

```bash
git clone https://github.com/sqacetimee/habiverse.git
cd habiverse/habiverse
npm install
npm run dev
```

The `predev` script automatically fetches fresh planet data from NASA before starting the server. The first run takes ~20 seconds to download all 5,000 planets; subsequent runs skip the fetch if the data is less than 24 hours old.

```
http://localhost:3000
```

---

## References

- Zahnle, K. & Catling, D. (2017). *The Cosmic Shoreline: The Evidence that Escape Determines which Planets Have Atmospheres.* ApJ, 843, 122.
- Fulton, B. et al. (2017). *The California-Kepler Survey III: A Gap in the Radius Distribution of Small Planets.* AJ, 154, 109.
- Schulze-Makuch, D. et al. (2021). *In Search for a Planet Better than Earth: Top Contenders for a Superhabitable World.* Astrobiology, 21(10).
- Kopparapu, R. et al. (2013). *Habitable Zones Around Main-Sequence Stars.* ApJ, 765, 131.
