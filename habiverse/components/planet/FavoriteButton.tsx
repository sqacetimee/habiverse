"use client";

import { Heart } from "lucide-react";

interface FavoriteButtonProps {
  planetId: string;
  favorites: Set<string>;
  onToggle: (id: string) => void;
  size?: number;
}

export function FavoriteButton({
  planetId,
  favorites,
  onToggle,
  size = 16,
}: FavoriteButtonProps) {
  const isFav = favorites.has(planetId);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onToggle(planetId);
      }}
      aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
      className="p-1.5 rounded-lg transition-all duration-200"
      style={{
        color: isFav ? "#f43f5e" : "rgba(165,180,252,0.4)",
        background: isFav ? "rgba(244,63,94,0.1)" : "transparent",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = isFav ? "#fb7185" : "rgba(244,63,94,0.7)";
        e.currentTarget.style.background = "rgba(244,63,94,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = isFav ? "#f43f5e" : "rgba(165,180,252,0.4)";
        e.currentTarget.style.background = isFav ? "rgba(244,63,94,0.1)" : "transparent";
      }}
    >
      <Heart
        size={size}
        fill={isFav ? "#f43f5e" : "none"}
        strokeWidth={2}
      />
    </button>
  );
}
