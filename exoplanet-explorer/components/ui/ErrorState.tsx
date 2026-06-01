import { AlertTriangle, RefreshCw } from "lucide-react";
import { GlowButton } from "./GlowButton";

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
  usingFallback?: boolean;
}

export function ErrorState({ error, onRetry, usingFallback }: ErrorStateProps) {
  if (usingFallback) {
    return (
      <div style={{
        display: "flex", alignItems: "flex-start", gap: 12,
        padding: "14px 18px", borderRadius: 12,
        background: "rgba(234,179,8,0.07)",
        border: "1px solid rgba(234,179,8,0.2)",
      }}>
        <AlertTriangle size={15} style={{ color: "#f59e0b", flexShrink: 0, marginTop: 1 }} />
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: "#fcd34d", margin: 0 }}>
            Using fallback sample data — NASA data could not be loaded.
          </p>
          <p style={{ fontSize: 12, color: "rgba(253,211,77,0.6)", margin: "4px 0 0" }}>
            Showing 20 curated well-known exoplanets. Live NASA data may be temporarily unavailable.
          </p>
          {onRetry && (
            <button onClick={onRetry} style={{
              marginTop: 8, display: "inline-flex", alignItems: "center", gap: 5,
              fontSize: 12, color: "#fcd34d", background: "none", border: "none",
              cursor: "pointer", padding: 0, textDecoration: "underline", textUnderlineOffset: 3,
            }}>
              <RefreshCw size={11} /> Try again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      gap: 16, padding: "48px 24px",
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)",
      }}>
        <AlertTriangle size={22} style={{ color: "#f87171" }} />
      </div>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 14, fontWeight: 500, color: "#fca5a5", margin: 0 }}>Failed to load</p>
        <p style={{ fontSize: 12, color: "rgba(165,180,252,0.4)", marginTop: 6, maxWidth: 320 }}>{error}</p>
      </div>
      {onRetry && (
        <GlowButton onClick={onRetry} variant="secondary" size="sm">
          <RefreshCw size={13} /> Retry
        </GlowButton>
      )}
    </div>
  );
}
