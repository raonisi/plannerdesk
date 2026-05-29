"use client";

import { Star } from "lucide-react";

export function FavoriteButton({
  active,
  label,
  onToggle,
  className = "",
}: {
  active: boolean;
  label: string;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={active ? `${label} 즐겨찾기 해제` : `${label} 즐겨찾기 추가`}
      aria-pressed={active}
      onClick={(event) => {
        event.stopPropagation();
        onToggle();
      }}
      className={`inline-flex min-h-10 min-w-10 items-center justify-center rounded-md text-[#C4B8A8] transition hover:text-[#B9975B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/25 focus-visible:ring-offset-2 ${className}`.trim()}
    >
      <Star
        className={`h-4 w-4 ${active ? "fill-[#B9975B] text-[#B9975B]" : ""}`}
      />
    </button>
  );
}
