import { ReactNode, CSSProperties, MouseEventHandler } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  hover?: boolean;
  glow?: boolean;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

export function GlassCard({
  children, className = "", style, hover = false, glow = false, onClick,
}: GlassCardProps) {
  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        position: "relative",
        background: "rgba(13,18,45,0.6)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(99,102,241,0.15)",
        borderRadius: 16,
        /* Top highlight */
        boxShadow: glow
          ? "0 0 0 1px rgba(99,102,241,0.1) inset, 0 1px 0 rgba(255,255,255,0.04) inset, 0 0 32px rgba(99,102,241,0.1)"
          : "0 0 0 1px rgba(99,102,241,0.08) inset, 0 1px 0 rgba(255,255,255,0.035) inset",
        transition: hover ? "all 0.22s cubic-bezier(0.4,0,0.2,1)" : undefined,
        cursor: onClick ? "pointer" : undefined,
        ...style,
      }}
      onMouseEnter={hover ? (e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.borderColor = "rgba(99,102,241,0.32)";
        e.currentTarget.style.boxShadow =
          "0 0 0 1px rgba(99,102,241,0.15) inset, 0 1px 0 rgba(255,255,255,0.05) inset, 0 12px 40px rgba(0,0,0,0.3), 0 0 24px rgba(99,102,241,0.15)";
      } : undefined}
      onMouseLeave={hover ? (e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = "rgba(99,102,241,0.15)";
        e.currentTarget.style.boxShadow = glow
          ? "0 0 0 1px rgba(99,102,241,0.1) inset, 0 1px 0 rgba(255,255,255,0.04) inset, 0 0 32px rgba(99,102,241,0.1)"
          : "0 0 0 1px rgba(99,102,241,0.08) inset, 0 1px 0 rgba(255,255,255,0.035) inset";
      } : undefined}
    >
      {children}
    </div>
  );
}
