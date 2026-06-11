"use client";

import { FavoriteButton } from "@/components/launcher/favorite-button";
import { PlannerFavoritesLoginPrompt } from "@/components/planner-favorites/planner-favorites-login-prompt";
import { usePlannerFavoritesEnabled } from "@/components/planner-favorites/planner-favorites-scope";

export function GatedFavoriteButton({
  active,
  label,
  onToggle,
  callbackPath,
  className = "",
}: {
  active: boolean;
  label: string;
  onToggle: () => void;
  callbackPath?: string;
  className?: string;
}) {
  const enabled = usePlannerFavoritesEnabled();

  if (!enabled) {
    return (
      <PlannerFavoritesLoginPrompt
        callbackPath={callbackPath}
        className={className}
        compact
      />
    );
  }

  return (
    <FavoriteButton
      active={active}
      className={className}
      label={label}
      onToggle={onToggle}
    />
  );
}
