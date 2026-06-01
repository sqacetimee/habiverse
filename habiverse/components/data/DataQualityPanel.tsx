import { GlassCard } from "@/components/ui/GlassCard";

export interface FieldStat {
  label: string;
  description: string;
  pct: number;
}

export interface QualityStats {
  total: number;
  fields: FieldStat[];
  completeAll: number;
  missingMass: number;
  missingTemp: number;
}

function QualityRow({ label, description, pct }: FieldStat) {
  const color = pct >= 80 ? "#22c55e" : pct >= 60 ? "#84cc16" : pct >= 40 ? "#eab308" : "#f97316";
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-medium text-indigo-200">{label}</span>
          <span className="text-xs ml-2" style={{ color: "rgba(165,180,252,0.45)" }}>{description}</span>
        </div>
        <span className="text-sm font-semibold" style={{ color }}>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(99,102,241,0.1)" }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}77, ${color})` }}
        />
      </div>
    </div>
  );
}

export function DataQualityPanel({ stats }: { stats: QualityStats }) {
  return (
    <GlassCard className="p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-indigo-200">Data Completeness</h3>
        <span className="text-xs" style={{ color: "rgba(165,180,252,0.45)" }}>
          {stats.total.toLocaleString()} planets
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {stats.fields.map((f) => <QualityRow key={f.label} {...f} />)}
      </div>

      <div className="grid grid-cols-3 gap-4 pt-4" style={{ borderTop: "1px solid rgba(99,102,241,0.12)" }}>
        <div className="text-center">
          <div className="text-2xl font-bold text-indigo-300">{stats.completeAll.toLocaleString()}</div>
          <div className="text-xs mt-0.5" style={{ color: "rgba(165,180,252,0.45)" }}>All fields present</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-400">{stats.missingMass.toLocaleString()}</div>
          <div className="text-xs mt-0.5" style={{ color: "rgba(165,180,252,0.45)" }}>Missing mass</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-400">{stats.missingTemp.toLocaleString()}</div>
          <div className="text-xs mt-0.5" style={{ color: "rgba(165,180,252,0.45)" }}>Missing temp</div>
        </div>
      </div>

      <p className="text-xs leading-relaxed" style={{ color: "rgba(165,180,252,0.4)" }}>
        Missing values are common in exoplanet datasets. Radial velocity detections often lack radius
        measurements. Transit detections often lack mass. Equilibrium temperature requires both radius
        and stellar parameters. Data confidence scores penalise missing fields without eliminating
        planets from the dataset entirely.
      </p>
    </GlassCard>
  );
}
