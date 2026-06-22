"use client";

import type { ReactNode } from "react";
import {
  getToolActionLabel,
  getToolTypeLabel,
  type ToolKind,
} from "@/lib/tool-display";
import { externalLinkAriaLabel } from "@/lib/ui/external-link";
import { shadows } from "@/lib/design-system";
import {
  mobileCardBadgeRow,
  mobileCardDescription,
  mobileCardPadding,
  mobileCardShell,
  mobileCardTitleSm,
} from "@/lib/mobile/card-density";
import { FavoriteButton } from "./favorite-button";

export function ToolCard({
  title,
  description,
  kind,
  source,
  categoryLabel,
  icon,
  isActive,
  isFavorite,
  size = "default",
  onToggleFavorite,
  onRun,
}: {
  title: string;
  description: string;
  kind: ToolKind;
  source?: string;
  categoryLabel?: string;
  icon: ReactNode;
  isActive?: boolean;
  isFavorite: boolean;
  size?: "featured" | "default";
  onToggleFavorite: () => void;
  onRun: () => void;
}) {
  const typeLabel = getToolTypeLabel(kind);
  const actionLabel = getToolActionLabel(kind, source);
  const padding = size === "featured" ? "p-4 sm:p-6" : mobileCardPadding;
  const minHeight =
    size === "featured" ? "min-h-0 sm:min-h-[220px]" : "min-h-0 sm:min-h-[200px]";

  return (
    <article
      className={`relative flex flex-col justify-between rounded-xl border border-[#E3DED4] bg-white ${padding} ${minHeight} ${mobileCardShell} ${shadows.card} transition hover:-translate-y-0.5 hover:border-[#B9975B] hover:shadow-[0_10px_30px_rgba(15,29,46,0.08)] focus-within:ring-2 focus-within:ring-[#B9975B]/30 ${
        isActive ? "ring-2 ring-[#B9975B]" : ""
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#E3DED4] bg-[#F7F4EE]">
            {icon}
          </div>
          <FavoriteButton
            active={isFavorite}
            label={title}
            onToggle={onToggleFavorite}
          />
        </div>
        <h3 className={`mt-4 ${mobileCardTitleSm}`}>
          {title}
        </h3>
        <p className={`mt-1.5 ${mobileCardDescription}`}>
          {description}
        </p>
        <div className={`mt-3 ${mobileCardBadgeRow}`}>
          <span className="rounded-md border border-[#E3DED4] bg-[#F7F4EE] px-2 py-0.5 text-[10px] font-bold text-[#16382C]">
            {typeLabel}
          </span>
          {categoryLabel ? (
            <span className="rounded-md border border-[#E3DED4] bg-white px-2 py-0.5 text-[10px] font-semibold text-[#4A5565]">
              {categoryLabel}
            </span>
          ) : null}
        </div>
      </div>
      <div className="mt-5">
        <button
          type="button"
          onClick={onRun}
          aria-label={
            kind === "external"
              ? externalLinkAriaLabel(`${title} ${actionLabel}`)
              : `${title} ${actionLabel}`
          }
          className={`inline-flex min-h-11 w-full items-center justify-center rounded-lg text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/35 focus-visible:ring-offset-2 ${
            kind === "external"
              ? "border border-[#16382C] bg-white text-[#16382C] hover:bg-[#F7F4EE]"
              : "bg-[#0F1D2E] text-white hover:bg-[#17202A]"
          }`}
        >
          {actionLabel}
        </button>
      </div>
    </article>
  );
}
