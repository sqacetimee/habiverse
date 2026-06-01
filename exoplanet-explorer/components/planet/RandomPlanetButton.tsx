"use client";

import { useRouter } from "next/navigation";
import { Shuffle } from "lucide-react";
import { GlowButton } from "@/components/ui/GlowButton";
import type { Planet } from "@/lib/types";

interface RandomPlanetButtonProps {
  planets: Planet[];
}

export function RandomPlanetButton({ planets }: RandomPlanetButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (planets.length === 0) return;
    const random = planets[Math.floor(Math.random() * planets.length)];
    router.push(`/planets/${random.id}`);
  };

  return (
    <GlowButton onClick={handleClick} variant="secondary" size="sm" disabled={planets.length === 0}>
      <Shuffle size={14} /> Random Planet
    </GlowButton>
  );
}
