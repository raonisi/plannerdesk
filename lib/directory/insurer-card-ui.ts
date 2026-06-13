const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2";

export const insurerCardShell =
  "group/insurer relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-slate-100 transition hover:shadow-md sm:p-6";

export const insurerCardFeaturedBar =
  "absolute inset-x-0 top-0 h-1 bg-slate-900";

export const insurerCardSectionTitle =
  "text-xs font-semibold uppercase tracking-wide text-slate-500";

export const insurerCardCategoryBadge =
  "inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600";

export const insurerCardInsurerName =
  "break-words text-lg font-bold tracking-tight text-slate-950 sm:text-xl";

export const insurerCardPrimaryButton = `inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 ${focusRing}`;

export const insurerCardSecondaryButton = `inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-2.5 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100 ${focusRing}`;

export const insurerCardOutlineButton = `inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 ${focusRing}`;

export const insurerCardSubtleButton = `inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 ${focusRing}`;

export const insurerCardMissingSlot =
  "inline-flex min-h-[44px] w-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-500 break-words whitespace-normal text-center";

export const insurerCardClaimToggle = (open: boolean) =>
  `inline-flex min-h-[44px] w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${focusRing} ${
    open
      ? "border-emerald-300 bg-emerald-50 text-emerald-900"
      : "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
  }`;

export const insurerCardClaimPanel =
  "mt-4 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4";

export const insurerCardClaimNotice =
  "border-t border-slate-200 pt-3 text-xs leading-relaxed text-slate-500";

export const insurerCardDetailedToggle = (open: boolean) =>
  `inline-flex min-h-[44px] w-full items-center justify-center rounded-xl border text-sm font-semibold transition ${focusRing} ${
    open
      ? "border-slate-300 bg-slate-100 text-slate-900"
      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
  }`;

export const insurerCardTrustNote =
  "rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium leading-relaxed text-slate-500";

export const insurerCardContactTile =
  "flex min-h-[44px] flex-col justify-center rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:bg-slate-50";

export const insurerCardPdfDownloadButton = `inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 ${focusRing}`;

export const insurerCardPdfSecondaryButton = `inline-flex min-h-[44px] w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 ${focusRing}`;
