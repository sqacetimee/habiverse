/** Shimmer skeleton for cards while NASA data is loading */
export function Skeleton({ style }: { style?: React.CSSProperties }) {
  return (
    <div style={{
      background: "linear-gradient(90deg, rgba(99,102,241,0.06) 25%, rgba(99,102,241,0.12) 50%, rgba(99,102,241,0.06) 75%)",
      backgroundSize: "400px 100%",
      animation: "skeletonShimmer 1.6s ease infinite",
      borderRadius: 8,
      ...style,
    }} />
  );
}

export function PlanetCardSkeleton() {
  return (
    <div style={{
      padding: 18, borderRadius: 16, height: "100%",
      background: "rgba(13,18,45,0.5)",
      border: "1px solid rgba(99,102,241,0.1)",
      display: "flex", flexDirection: "column", gap: 14,
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <Skeleton style={{ height: 16, width: "65%", marginBottom: 8 }} />
          <Skeleton style={{ height: 12, width: "45%" }} />
        </div>
        <Skeleton style={{ width: 22, height: 22, borderRadius: "50%" }} />
      </div>
      {/* Planet + badges */}
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <Skeleton style={{ width: 56, height: 56, borderRadius: "50%", flexShrink: 0 }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
          <Skeleton style={{ height: 22, width: "80%", borderRadius: 99 }} />
          <Skeleton style={{ height: 16, width: "55%", borderRadius: 99 }} />
        </div>
      </div>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: "auto" }}>
        {[0,1,2,3].map((i) => (
          <Skeleton key={i} style={{ height: 42, borderRadius: 8 }} />
        ))}
      </div>
    </div>
  );
}
