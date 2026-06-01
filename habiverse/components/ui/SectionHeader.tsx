interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  center?: boolean;
}

export function SectionHeader({ title, subtitle, badge, center = false }: SectionHeaderProps) {
  return (
    <div style={{ marginBottom: 28, textAlign: center ? "center" : "left" }}>
      {badge && (
        <span style={{
          display: "inline-block", marginBottom: 10,
          fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
          color: "#818cf8", background: "rgba(99,102,241,0.1)",
          border: "1px solid rgba(99,102,241,0.2)", borderRadius: 99,
          padding: "3px 12px",
        }}>
          {badge}
        </span>
      )}
      <h1 style={{
        fontSize: "clamp(22px, 4vw, 30px)", fontWeight: 700,
        letterSpacing: "-0.03em", lineHeight: 1.15, margin: 0,
        background: "linear-gradient(135deg, #e2e8f0 0%, #c7d2fe 60%, #a5b4fc 100%)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
      }}>
        {title}
      </h1>
      {subtitle && (
        <p style={{
          marginTop: 8, fontSize: 14, lineHeight: 1.6,
          color: "rgba(165,180,252,0.6)", maxWidth: 560,
          marginLeft: center ? "auto" : undefined, marginRight: center ? "auto" : undefined,
        }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
