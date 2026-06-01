import React, { ReactNode, CSSProperties } from "react";
import Link from "next/link";

interface GlowButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
  style?: CSSProperties;
}

const SIZE_STYLES: Record<string, CSSProperties> = {
  sm: { padding: "7px 14px", fontSize: 13 },
  md: { padding: "9px 18px", fontSize: 14 },
  lg: { padding: "12px 26px", fontSize: 14 },
};

const VARIANT_STYLES: Record<string, CSSProperties> = {
  primary: {
    background: "linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)",
    color: "#fff",
    border: "1px solid transparent",
    boxShadow: "0 0 22px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
  },
  secondary: {
    background: "rgba(99,102,241,0.1)",
    color: "#a5b4fc",
    border: "1px solid rgba(99,102,241,0.28)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
  },
  ghost: {
    background: "transparent",
    color: "rgba(165,180,252,0.65)",
    border: "1px solid rgba(99,102,241,0.14)",
    boxShadow: "none",
  },
};

export function GlowButton({
  children, href, onClick, variant = "primary",
  size = "md", className = "", disabled = false, style,
}: GlowButtonProps) {
  const base: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    fontWeight: 500,
    borderRadius: 10,
    letterSpacing: "-0.01em",
    transition: "all 0.18s cubic-bezier(0.4,0,0.2,1)",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.45 : 1,
    textDecoration: "none",
    whiteSpace: "nowrap",
    ...SIZE_STYLES[size],
    ...VARIANT_STYLES[variant],
    ...style,
  };

  const enter = (e: React.MouseEvent<HTMLElement>) => {
    if (disabled) return;
    const el = e.currentTarget;
    if (variant === "primary") {
      el.style.transform = "translateY(-1px)";
      el.style.boxShadow = "0 0 36px rgba(99,102,241,0.6), inset 0 1px 0 rgba(255,255,255,0.15)";
    } else {
      el.style.transform = "translateY(-1px)";
      el.style.borderColor = "rgba(99,102,241,0.5)";
      el.style.color = "#c7d2fe";
      el.style.background = variant === "secondary" ? "rgba(99,102,241,0.16)" : "rgba(99,102,241,0.06)";
    }
  };

  const leave = (e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    el.style.transform = "translateY(0)";
    if (variant === "primary") {
      el.style.boxShadow = "0 0 22px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.1)";
    } else {
      el.style.borderColor = variant === "secondary" ? "rgba(99,102,241,0.28)" : "rgba(99,102,241,0.14)";
      el.style.color = variant === "secondary" ? "#a5b4fc" : "rgba(165,180,252,0.65)";
      el.style.background = variant === "secondary" ? "rgba(99,102,241,0.1)" : "transparent";
    }
  };

  if (href) {
    return (
      <Link href={href} className={className} style={base}
        onMouseEnter={enter} onMouseLeave={leave}>
        {children}
      </Link>
    );
  }

  return (
    <button className={className} style={base} onClick={onClick}
      disabled={disabled} onMouseEnter={enter} onMouseLeave={leave}>
      {children}
    </button>
  );
}
