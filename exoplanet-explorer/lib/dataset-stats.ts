/**
 * Hard-coded from the full 5,000-planet pscomppars snapshot.
 * Re-run the node snippet below after regenerating planets.json:
 *
 *   node -e "
 *   const p=JSON.parse(require('fs').readFileSync('public/data/planets.json','utf-8'));
 *   const pct=k=>Math.round(p.filter(x=>x[k]!=null).length/p.length*100);
 *   console.log('total',p.length,'radius',pct('radiusEarth'),'mass',pct('massEarth'),
 *     'period',pct('orbitalPeriodDays'),'temp',pct('equilibriumTempK'),
 *     'dist',pct('distanceParsecs'),'teff',pct('stellarTeff'),
 *     'method',pct('discoveryMethod'),'year',pct('discoveryYear'),
 *     'complete',p.filter(x=>x.radiusEarth!=null&&x.massEarth!=null&&x.orbitalPeriodDays!=null&&x.equilibriumTempK!=null&&x.distanceParsecs!=null&&x.discoveryMethod!=null).length,
 *     'noMass',p.filter(x=>x.massEarth==null).length,
 *     'noTemp',p.filter(x=>x.equilibriumTempK==null).length);
 *   "
 */

import type { QualityStats } from "@/components/data/DataQualityPanel";
import type { CompletenessEntry } from "@/components/charts/DataCompletenessChart";

export const DATASET_QUALITY: QualityStats = {
  total:       5000,
  completeAll: 3848,
  missingMass: 29,
  missingTemp: 1079,
  fields: [
    { label: "Radius",         description: "pl_rade",         pct: 99  },
    { label: "Mass",           description: "pl_bmasse",       pct: 99  },
    { label: "Orbital Period", description: "pl_orbper",       pct: 94  },
    { label: "Eq. Temp",       description: "pl_eqt",          pct: 78  },
    { label: "Distance",       description: "sy_dist",         pct: 99  },
    { label: "Stellar Teff",   description: "st_teff",         pct: 95  },
    { label: "Method",         description: "discoverymethod", pct: 100 },
    { label: "Year",           description: "disc_year",       pct: 100 },
  ],
};

export const COMPLETENESS_CHART_DATA: CompletenessEntry[] = DATASET_QUALITY.fields.map(
  (f) => ({ label: f.label, pct: f.pct })
);
