export function LoadingState({ message = "Loading NASA Exoplanet Archive…" }: { message?: string }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "72px 24px", gap: 24,
    }}>
      {/* Orbital loader */}
      <div style={{ position: "relative", width: 72, height: 72 }}>
        {[
          { inset: 0,  dur: "1.3s",  color: "#6366f1" },
          { inset: 12, dur: "0.95s", color: "#8b5cf6", reverse: true },
          { inset: 24, dur: "0.65s", color: "#38bdf8" },
        ].map(({ inset, dur, color, reverse }, i) => (
          <div key={i} style={{
            position: "absolute", inset, borderRadius: "50%",
            border: "1.5px solid transparent",
            borderTopColor: color,
            borderRightColor: `${color}44`,
            animation: `spin${reverse ? "-reverse" : ""} ${dur} linear infinite`,
          }} />
        ))}
        <div style={{
          position: "absolute", inset: 30, borderRadius: "50%",
          background: "radial-gradient(circle, #6366f1, #4f46e5)",
          boxShadow: "0 0 16px rgba(99,102,241,0.8)",
        }} />
      </div>

      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 14, fontWeight: 500, color: "#a5b4fc", margin: "0 0 6px" }}>
          {message}
        </p>
        <p style={{ fontSize: 11, color: "rgba(165,180,252,0.35)", margin: 0, letterSpacing: "0.04em" }}>
          pscomppars · TAP/sync · JSON
        </p>
      </div>
    </div>
  );
}
