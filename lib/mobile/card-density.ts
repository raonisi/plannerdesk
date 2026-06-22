/**
 * PR-UX-15: Mobile card density tokens for 390px public surfaces.
 * Extends design-system touch targets — do not duplicate min-h-11 rules elsewhere.
 */

import { touchTargets } from "@/lib/design-system";

/** Card shell: prevents horizontal bleed inside grids/lists. */
export const mobileCardShell =
  "min-w-0 max-w-full overflow-hidden";

/** Mobile-first padding (~14–16px). */
export const mobileCardPadding = "p-3.5 sm:p-5";

export const mobileCardPaddingRoomy = "p-3.5 sm:p-6";

/** Internal vertical rhythm (8–12px). */
export const mobileCardStack = "flex flex-col gap-2.5 sm:gap-3";

/** Title hierarchy — 2 lines max on narrow viewports. */
export const mobileCardTitle =
  "line-clamp-2 break-words text-base font-bold leading-snug text-[#0F1D2E] sm:text-lg";

export const mobileCardTitleSm =
  "line-clamp-2 break-words text-sm font-bold leading-snug text-[#0F1D2E] sm:text-base";

/** Secondary copy — 2 lines max. */
export const mobileCardDescription =
  "line-clamp-2 break-keep text-xs leading-relaxed text-[#4A5565] sm:text-sm";

/** Badge/status rows wrap instead of forcing single line. */
export const mobileCardBadgeRow =
  "flex flex-wrap items-center gap-1.5 sm:gap-2";

/** CTA groups stack on mobile, wrap on larger screens. */
export const mobileCardActions =
  "mt-3 flex min-w-0 w-full flex-col gap-2 sm:mt-4 sm:flex-row sm:flex-wrap";

export const mobileCardActionsTight =
  "flex min-w-0 w-full flex-col gap-2 sm:flex-row sm:flex-wrap";

/** Keep counts and units on one line when possible. */
export const mobileCardTabular =
  "tabular-nums [word-break:keep-all]";

/** Shared touch target re-export for card CTAs. */
export const mobileCardTouchTarget = touchTargets.minHeight;

/** List gap between cards (~10–14px). */
export const mobileCardListGap = "space-y-3 sm:space-y-3.5";

export const mobileCardTokens = {
  shell: mobileCardShell,
  padding: mobileCardPadding,
  paddingRoomy: mobileCardPaddingRoomy,
  stack: mobileCardStack,
  title: mobileCardTitle,
  titleSm: mobileCardTitleSm,
  description: mobileCardDescription,
  badgeRow: mobileCardBadgeRow,
  actions: mobileCardActions,
  actionsTight: mobileCardActionsTight,
  tabular: mobileCardTabular,
  touchTarget: mobileCardTouchTarget,
  listGap: mobileCardListGap,
} as const;
