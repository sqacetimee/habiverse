import { Search, RotateCcw } from "lucide-react";
import { GlowButton } from "./GlowButton";

interface EmptyStateProps {
  title?: string;
  description?: string;
  onReset?: () => void;
}

export function EmptyState({
  title = "No planets match your filters",
  description = "Try widening your search or resetting your filters.",
  onReset,
}: EmptyStateProps) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "64px 24px", gap: 18,
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.14)",
      }}>
        <Search size={22} style={{ color: "rgba(165,180,252,0.35)" }} />
      </div>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 14, fontWeight: 500, color: "#a5b4fc", margin: 0 }}>{title}</p>
        <p style={{ fontSize: 13, color: "rgba(165,180,252,0.45)", marginTop: 6, maxWidth: 280 }}>
          {description}
        </p>
      </div>
      {onReset && (
        <GlowButton onClick={onReset} variant="ghost" size="sm">
          <RotateCcw size={13} /> Reset Filters
        </GlowButton>
      )}
    </div>
  );
}
