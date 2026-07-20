"use client";

import { usePlannerSignInPath } from "@/components/planner-favorites/planner-favorites-scope";
import { buildPlannerSignInHref } from "@/lib/auth/planner-sign-in-url";
import {
  PLANNER_FAVORITES_COMPACT_UNAVAILABLE_LABEL,
  PLANNER_FAVORITES_LOGIN_BODY_AVAILABLE,
  PLANNER_FAVORITES_LOGIN_CTA,
  PLANNER_FAVORITES_LOGIN_RETURN_NOTE,
  PLANNER_FAVORITES_LOGIN_TITLE_AVAILABLE,
  PLANNER_FAVORITES_UNAVAILABLE_BODY,
  PLANNER_FAVORITES_UNAVAILABLE_TITLE,
} from "@/lib/planner-favorites/copy";
import { textStyles } from "@/lib/design-system";

export function PlannerFavoritesLoginPrompt({
  callbackPath = "/",
  compact = false,
  className = "",
}: {
  callbackPath?: string;
  compact?: boolean;
  className?: string;
}) {
  const signInPath = usePlannerSignInPath();
  const signInHref = buildPlannerSignInHref(signInPath, callbackPath);

  if (compact) {
    if (signInHref) {
      return (
        <a
          className={`inline-flex min-h-9 items-center rounded-md border border-[#E3DED4] bg-white px-2.5 text-[11px] font-semibold text-[#4A5565] transition hover:border-[#B9975B] hover:text-[#0F1D2E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/20 ${className}`}
          href={signInHref}
        >
          {PLANNER_FAVORITES_LOGIN_CTA}
        </a>
      );
    }

    return (
      <span
        className={`inline-flex min-h-9 items-center rounded-md border border-dashed border-[#E3DED4] bg-[#F8F7F3] px-2.5 text-[11px] font-semibold text-[#4A5565] ${className}`}
        title={PLANNER_FAVORITES_UNAVAILABLE_TITLE}
      >
        {PLANNER_FAVORITES_COMPACT_UNAVAILABLE_LABEL}
      </span>
    );
  }

  if (!signInHref) {
    return (
      <div
        className={`rounded-xl border border-dashed border-[#E3DED4] bg-[#F8F7F3] p-4 ${className}`}
      >
        <p className={`break-keep font-semibold text-[#0F1D2E] ${textStyles.small}`}>
          {PLANNER_FAVORITES_UNAVAILABLE_TITLE}
        </p>
        <p className={`mt-1 break-keep ${textStyles.small}`}>
          {PLANNER_FAVORITES_UNAVAILABLE_BODY}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border border-dashed border-[#E3DED4] bg-[#F8F7F3] p-4 ${className}`}
    >
      <p className={`break-keep font-semibold text-[#0F1D2E] ${textStyles.small}`}>
        {PLANNER_FAVORITES_LOGIN_TITLE_AVAILABLE}
      </p>
      <p className={`mt-1 break-keep ${textStyles.small}`}>
        {PLANNER_FAVORITES_LOGIN_BODY_AVAILABLE}
      </p>
      <a
        className="mt-3 inline-flex min-h-10 items-center rounded-lg bg-[#0F1D2E] px-4 text-sm font-semibold text-white transition hover:bg-[#1b344e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/35"
        href={signInHref}
      >
        {PLANNER_FAVORITES_LOGIN_CTA}
      </a>
      <p className={`mt-2 break-keep text-[#4A5565] ${textStyles.small}`}>
        {PLANNER_FAVORITES_LOGIN_RETURN_NOTE}
      </p>
    </div>
  );
}
