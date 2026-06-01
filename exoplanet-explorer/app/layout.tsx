import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SpaceBackground } from "@/components/layout/SpaceBackground";
import { NavigationProgress } from "@/components/layout/NavigationProgress";
import { PlanetsProvider } from "@/components/providers/PlanetsProvider";

export const metadata: Metadata = {
  title: "Habiverse",
  description:
    "Explore 5,000+ confirmed exoplanets from the NASA Exoplanet Archive. Compare distant worlds to Earth, rank them by habitability, and visualise the known universe.",
  keywords: ["exoplanets","NASA","space","astronomy","habitability","kepler","TRAPPIST"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" style={{ height: "100%" }}>
      <head>
        {/* Preload planet data — browser fetches this the moment HTML is parsed,
            before JS even runs, so PlanetsProvider.fetch() hits a warm cache */}
        <link rel="preload" as="fetch" href="/data/planets.json" crossOrigin="anonymous" />
        {/* Silent reload on stale chunk after HMR / redeploy */}
        <script dangerouslySetInnerHTML={{
          __html: `window.addEventListener('error',function(e){var m=(e&&e.message)||'';if(m.indexOf('Loading chunk')!==-1||m.indexOf('ChunkLoadError')!==-1){window.location.reload();}},true);` +
            // Recharts' ResponsiveContainer uses ResizeObserver internally.
            // In some browsers the observer error callback rejects a Promise
            // with a raw DOM Event (not an Error), producing [object Event].
            // Suppress these harmless rejections so the dev overlay stays clean.
            `window.addEventListener('unhandledrejection',function(e){var r=e.reason;if(r&&typeof r==='object'&&!(r instanceof Error)&&typeof r.type==='string'){e.preventDefault();}},false);`,
        }} />
      </head>
      <body style={{
        minHeight: "100%", display: "flex", flexDirection: "column",
        background: "#030712", color: "#e2e8f0",
        fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI','Inter','Helvetica Neue',Arial,sans-serif",
        WebkitFontSmoothing: "antialiased", MozOsxFontSmoothing: "grayscale",
      }}>
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        <SpaceBackground />
        <Navbar />
        <PlanetsProvider>
          <main style={{ flex: 1, position: "relative", zIndex: 10, paddingTop: 60 }}>
            {children}
          </main>
        </PlanetsProvider>
        <Footer />
      </body>
    </html>
  );
}
