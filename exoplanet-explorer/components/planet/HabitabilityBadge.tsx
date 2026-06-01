import { getScoreColor, getScoreLabel } from "@/lib/utils";

interface HabitabilityBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

export function HabitabilityBadge({ score, size = "md" }: HabitabilityBadgeProps) {
  const color = getScoreColor(score);
  const label = getScoreLabel(score);

  const cfg = {
    sm: { fontSize: 11, padding: "3px 9px", dotSize: 5 },
    md: { fontSize: 12, padding: "4px 11px", dotSize: 6 },
    lg: { fontSize: 13, padding: "6px 14px", dotSize: 7 },
  }[size];

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      fontSize: cfg.fontSize, fontWeight: 600,
      padding: cfg.padding, borderRadius: 99,
      color, background: `${color}14`,
      border: `1px solid ${color}30`,
      letterSpacing: "0.01em",
    }}>
      <span style={{
        width: cfg.dotSize, height: cfg.dotSize,
        borderRadius: "50%", background: color, flexShrink: 0,
        boxShadow: `0 0 8px ${color}, 0 0 4px ${color}`,
      }} />
      {score} · {label}
    </span>
  );
}
