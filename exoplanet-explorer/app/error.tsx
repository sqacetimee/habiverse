"use client";

import { useEffect } from "react";
import { GlowButton } from "@/components/ui/GlowButton";
import { RefreshCw, AlertTriangle } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isChunkError =
    error?.name === "ChunkLoadError" ||
    error?.message?.includes("Loading chunk") ||
    error?.message?.includes("ChunkLoadError") ||
    error?.message?.includes("Failed to fetch dynamically imported module");

  useEffect(() => {
    if (isChunkError) {
      // App was recompiled while this tab was open — silently reload.
      window.location.reload();
    }
  }, [isChunkError]);

  if (isChunkError) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", minHeight: "60vh", gap: 16, padding: 24,
      }}>
        <div style={{ position: "relative", width: 60, height: 60 }}>
          <div style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            border: "1.5px solid rgba(99,102,241,0.12)",
            borderTopColor: "#6366f1",
            animation: "spin 1.3s linear infinite",
          }} />
          <div style={{
            position: "absolute", inset: 20, borderRadius: "50%",
            background: "radial-gradient(circle, #6366f1, #4f46e5)",
          }} />
        </div>
        <p style={{ fontSize: 13, color: "rgba(165,180,252,0.5)", margin: 0 }}>
          App updated — reloading…
        </p>
      </div>
    );
  }

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "60vh", gap: 20, padding: 24,
      textAlign: "center",
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)",
      }}>
        <AlertTriangle size={22} style={{ color: "#f87171" }} />
      </div>
      <div>
        <p style={{ fontSize: 15, fontWeight: 600, color: "#fca5a5", margin: "0 0 6px" }}>
          Something went wrong
        </p>
        <p style={{ fontSize: 13, color: "rgba(165,180,252,0.4)", margin: 0, maxWidth: 360 }}>
          {error?.message ?? "An unexpected error occurred."}
        </p>
      </div>
      <GlowButton onClick={reset} variant="secondary" size="sm">
        <RefreshCw size={13} /> Try again
      </GlowButton>
    </div>
  );
}
