import { ExternalLink, Database, CheckCircle, AlertTriangle } from "lucide-react";

interface DataSourceBadgeProps {
  lastUpdated?: Date | null;
  usingFallback?: boolean;
  planetCount?: number;
  source?: "nasa" | "cache" | "fallback" | null;
}

export function DataSourceBadge({
  lastUpdated, usingFallback, planetCount, source,
}: DataSourceBadgeProps) {
  const isNasa    = !usingFallback && planetCount && planetCount > 100;
  const isFallback = usingFallback;

  const badgeStyle: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 500,
    textDecoration: "none", transition: "all 0.18s ease",
    ...(isNasa
      ? { background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.22)", color: "#86efac" }
      : isFallback
      ? { background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.22)", color: "#fcd34d" }
      : { background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", color: "#a5b4fc" }),
  };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
      <a
        href="https://exoplanetarchive.ipac.caltech.edu/"
        target="_blank" rel="noopener noreferrer"
        style={badgeStyle}
      >
        {isNasa
          ? <CheckCircle size={12} />
          : isFallback
          ? <AlertTriangle size={12} />
          : <Database size={12} />}
        {isFallback ? "Sample Data" : "NASA Exoplanet Archive"}
        <ExternalLink size={10} />
      </a>

      {planetCount !== undefined && planetCount > 0 && (
        <span style={{ fontSize: 12, color: "rgba(165,180,252,0.4)" }}>
          {planetCount.toLocaleString()} planets
          {source === "cache" && " (cached)"}
        </span>
      )}

      {lastUpdated && (
        <span style={{ fontSize: 11, color: "rgba(165,180,252,0.28)" }}>
          {lastUpdated.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}
