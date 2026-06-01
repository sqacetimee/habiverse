"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const doneRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Navigation started
    setVisible(true);
    setProgress(15);

    // Simulate progress up to 85% while page loads
    timerRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 85) return p;
        return p + Math.random() * 12;
      });
    }, 180);

    // After a short delay, complete the bar
    const complete = setTimeout(() => {
      if (timerRef.current) clearInterval(timerRef.current);
      setProgress(100);
      doneRef.current = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 300);
    }, 350);

    return () => {
      clearInterval(timerRef.current ?? undefined);
      clearTimeout(complete);
      clearTimeout(doneRef.current ?? undefined);
    };
  }, [pathname, searchParams]);

  if (!visible && progress === 0) return null;

  return (
    <div
      role="progressbar"
      aria-label="Page loading"
      style={{
        position: "fixed",
        top: 0, left: 0,
        height: 2,
        width: `${Math.min(progress, 100)}%`,
        background: "linear-gradient(90deg, #6366f1, #8b5cf6, #38bdf8)",
        boxShadow: "0 0 10px rgba(99,102,241,0.7), 0 0 20px rgba(99,102,241,0.3)",
        zIndex: 9999,
        transition: progress === 100
          ? "width 0.15s ease"
          : "width 0.18s ease",
        opacity: visible ? 1 : 0,
      }}
    />
  );
}
