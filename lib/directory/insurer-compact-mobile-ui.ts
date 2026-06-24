const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1D2E]/35 focus-visible:ring-offset-2";

/** Compact mobile directory row — lighter than desktop workbench card shell (PR-UX-19). */
export const insurerCompactMobileRowShell =
  "min-w-0 overflow-hidden rounded-xl border border-[#E3DED4] bg-white px-3 py-2.5";

export const insurerCompactMobileDetailPanel =
  "mt-3 border-t border-[#E3DED4] pt-3 print:hidden";

export function insurerCompactMobileExpandButton(expanded: boolean) {
  return `inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg border px-3 text-xs font-bold transition ${focusRing} ${
    expanded
      ? "border-[#0F1D2E] bg-[#F7F4EE] text-[#0F1D2E]"
      : "border-[#E3DED4] bg-white text-[#4A5565] hover:border-[#B9975B] hover:bg-[#F7F4EE] hover:text-[#0F1D2E]"
  }`;
}
