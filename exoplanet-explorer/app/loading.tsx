export default function GlobalLoading() {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "60vh", gap: 28,
    }}>
      <div style={{ position: "relative", width: 80, height: 80 }}>
        <div style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          border: "1.5px solid rgba(99,102,241,0.12)",
          borderTopColor: "#6366f1",
          animation: "spin 1.3s linear infinite",
        }} />
        <div style={{
          position: "absolute", inset: 12, borderRadius: "50%",
          border: "1.5px solid rgba(139,92,246,0.1)",
          borderTopColor: "#8b5cf6",
          animation: "spin-reverse 0.9s linear infinite",
        }} />
        <div style={{
          position: "absolute", inset: 24, borderRadius: "50%",
          border: "1.5px solid rgba(56,189,248,0.1)",
          borderTopColor: "#38bdf8",
          animation: "spin 0.65s linear infinite",
        }} />
        <div style={{
          position: "absolute", inset: 34, borderRadius: "50%",
          background: "radial-gradient(circle, #6366f1, #4f46e5)",
          boxShadow: "0 0 16px rgba(99,102,241,0.8)",
        }} />
      </div>
      <p style={{ fontSize: 13, color: "rgba(165,180,252,0.5)", margin: 0 }}>
        Loading…
      </p>
    </div>
  );
}
