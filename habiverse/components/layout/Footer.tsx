import Link from "next/link";
import { Telescope, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer
      className="relative z-10 mt-auto"
      style={{
        borderTop: "1px solid rgba(99,102,241,0.12)",
        background: "rgba(8,12,31,0.8)",
      }}
    >
      <div style={{ width: "100%", padding: "40px 28px 28px" }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
              >
                <Telescope size={12} className="text-white" />
              </div>
              <span className="text-sm font-semibold text-indigo-300">
                Habiverse
              </span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "rgba(165,180,252,0.5)" }}>
              A portfolio-grade dashboard for exploring confirmed exoplanets using
              real data from the NASA Exoplanet Archive.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-3">
              Pages
            </h4>
            <ul className="flex flex-col gap-2">
              {[
                { href: "/explore", label: "Explorer" },
                { href: "/stats", label: "Statistics" },
                { href: "/model", label: "Habitability Model" },
                { href: "/data", label: "Data Quality" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-xs transition-colors"
                    style={{ color: "rgba(165,180,252,0.55)" }}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-3">
              Data Source
            </h4>
            <a
              href="https://exoplanetarchive.ipac.caltech.edu/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs transition-colors"
              style={{ color: "rgba(165,180,252,0.55)" }}
            >
              NASA Exoplanet Archive
              <ExternalLink size={11} />
            </a>
            <p className="text-xs mt-2 leading-relaxed" style={{ color: "rgba(165,180,252,0.35)" }}>
              Data from the Planetary Systems Composite Parameters (pscomppars) table.
            </p>
          </div>
        </div>

        <div
          className="mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderTop: "1px solid rgba(99,102,241,0.08)" }}
        >
          <p className="text-xs" style={{ color: "rgba(165,180,252,0.3)" }}>
            Built for educational and portfolio purposes. Habitability scores are simplified statistical estimates.
          </p>
          <p className="text-xs" style={{ color: "rgba(165,180,252,0.3)" }}>
            Data © NASA Exoplanet Archive
          </p>
        </div>
      </div>
    </footer>
  );
}
