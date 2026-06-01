"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Telescope } from "lucide-react";

const NAV_LINKS = [
  { href: "/explore",  label: "Explore" },
  { href: "/stats",    label: "Statistics" },
  { href: "/model",    label: "Habitability" },
  { href: "/data",     label: "Data Quality" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <style>{`
        .nav-inner {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          height: 60px;
          width: 100%;
          padding: 0 28px;
        }
        .nav-center-links { display: flex; align-items: center; justify-content: center; }
        .nav-right        { display: flex; align-items: center; justify-content: flex-end; }
        .nav-hamburger    { display: none; }

        @media (max-width: 768px) {
          .nav-inner { grid-template-columns: 1fr auto; }
          .nav-center-links { display: none; }
          .nav-hamburger { display: flex; }
        }

        .nav-pill {
          padding: 6px 14px;
          border-radius: 99px;
          font-size: 13px;
          font-weight: 500;
          text-decoration: none;
          letter-spacing: -0.01em;
          white-space: nowrap;
          transition: all 0.16s ease;
          border: 1px solid transparent;
          color: rgba(165,180,252,0.55);
          background: transparent;
        }
        .nav-pill:hover {
          color: #e2e8f0;
          background: rgba(99,102,241,0.1);
        }
        .nav-pill.active {
          color: #e2e8f0;
          background: linear-gradient(135deg, rgba(99,102,241,0.4), rgba(139,92,246,0.25));
          border-color: rgba(99,102,241,0.32);
          box-shadow: 0 0 14px rgba(99,102,241,0.2), inset 0 1px 0 rgba(255,255,255,0.07);
        }
      `}</style>

      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        background: "rgba(4,6,18,0.78)",
        backdropFilter: "blur(22px)",
        WebkitBackdropFilter: "blur(22px)",
        borderBottom: "1px solid rgba(99,102,241,0.1)",
        boxShadow: "0 1px 0 rgba(255,255,255,0.025), 0 4px 20px rgba(0,0,0,0.35)",
      }}>
        <div className="nav-inner">

          {/* ── Column 1: Logo (left) ─────────────────────────── */}
          <Link href="/" style={{
            display: "flex", alignItems: "center", gap: 9,
            textDecoration: "none", justifyContent: "flex-start",
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 55%, #38bdf8 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 14px rgba(99,102,241,0.5), 0 0 28px rgba(139,92,246,0.18)",
              position: "relative",
            }}>
              <div style={{
                position: "absolute", inset: 3, borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.15)",
              }} />
              <Telescope size={13} color="#fff" strokeWidth={2.2} />
            </div>
            <span style={{
              fontSize: 14, fontWeight: 700, letterSpacing: "-0.03em",
              background: "linear-gradient(90deg, #e2e8f0 0%, #a5b4fc 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              whiteSpace: "nowrap",
            }}>
              Habiverse
            </span>
          </Link>

          {/* ── Column 2: Nav links (true centre) ─────────────── */}
          <div className="nav-center-links">
            <div style={{
              display: "flex", alignItems: "center", gap: 2,
              padding: "4px", borderRadius: 99,
              background: "rgba(99,102,241,0.05)",
              border: "1px solid rgba(99,102,241,0.11)",
            }}>
              {NAV_LINKS.map(({ href, label }) => {
                const active = pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`nav-pill${active ? " active" : ""}`}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* ── Column 3: Right side (mobile hamburger only) ───── */}
          <div className="nav-right">
            <button
              className="nav-hamburger"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
              style={{
                padding: 8, borderRadius: 8,
                border: "none", background: "transparent",
                color: "rgba(165,180,252,0.65)", cursor: "pointer",
                alignItems: "center", justifyContent: "center",
              }}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* ── Mobile dropdown ──────────────────────────────────── */}
        {open && (
          <div style={{
            borderTop: "1px solid rgba(99,102,241,0.1)",
            background: "rgba(4,6,18,0.97)",
            padding: "10px 20px 14px",
            display: "flex", flexDirection: "column", gap: 2,
          }}>
            {[{ href: "/", label: "Home" }, ...NAV_LINKS].map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link key={href} href={href} onClick={() => setOpen(false)} style={{
                  padding: "10px 14px", borderRadius: 9, fontSize: 14,
                  fontWeight: 500, textDecoration: "none",
                  color: active ? "#c7d2fe" : "rgba(165,180,252,0.6)",
                  background: active ? "rgba(99,102,241,0.14)" : "transparent",
                }}>
                  {label}
                </Link>
              );
            })}
          </div>
        )}
      </nav>
    </>
  );
}
