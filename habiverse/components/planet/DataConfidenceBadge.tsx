import { getConfidenceColor } from "@/lib/utils";

interface DataConfidenceBadgeProps {
  confidence: number;
  showBar?: boolean;
}

export function DataConfidenceBadge({ confidence, showBar = false }: DataConfidenceBadgeProps) {
  const color = getConfidenceColor(confidence);

  if (showBar) {
    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: "rgba(165,180,252,0.5)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 500 }}>
            Data Confidence
          </span>
          <span style={{ fontSize: 11, fontWeight: 700, color }}>{confidence}%</span>
        </div>
        <div style={{
          height: 4, borderRadius: 99, background: "rgba(99,102,241,0.1)", overflow: "hidden",
        }}>
          <div style={{
            height: "100%", borderRadius: 99, width: `${confidence}%`,
            background: `linear-gradient(90deg, ${color}77, ${color})`,
            transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
          }} />
        </div>
      </div>
    );
  }

  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      fontSize: 11, fontWeight: 500,
      padding: "3px 9px", borderRadius: 99,
      color, background: `${color}12`, border: `1px solid ${color}28`,
    }}>
      {confidence}% data
    </span>
  );
}
