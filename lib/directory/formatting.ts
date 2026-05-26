import type { PublicInsurer } from "@/lib/public/insurers";

// Centralized fallback copy for the public /directory UI. Keep these strings
// in sync with docs/INSURER_ACTION_FIELD_EXPANSION_PLAN.md Section F (data
// governance). Never render raw null, undefined, empty strings, or enum
// identifiers in the public surface.
export const DIRECTORY_TEXT = {
  missing: "\uacf5\uc2dd \ud655\uc778 \ud6c4 \uc5c5\ub370\uc774\ud2b8 \uc608\uc815",
  unavailable: "\ud574\ub2f9\uc0ac\ud56d \uc5c6\uc74c",
  callCenterIndividual: "\ucf5c\uc13c\ud130 \uac1c\ubcc4\uc811\uc218",
  conditional: "\uc870\uac74 \ud655\uc778 \ud544\uc694",
} as const;

export const CATEGORY_LABELS: Record<PublicInsurer["category"], string> = {
  life: "\uc0dd\uba85\ubcf4\ud5d8",
  non_life: "\uc190\ud574\ubcf4\ud5d8",
};

export function verificationStatusLabel(
  status: PublicInsurer["verificationStatus"],
): string {
  if (status === "verified") return "\uac80\uc218 \uc644\ub8cc";
  if (status === "needs_review") return "\uac80\uc218 \ud544\uc694";
  return "\uac80\uc218 \uc911";
}

// Normalize a Korean phone-style string into a tel: URL. Returns null when
// the value is empty or has no dialable characters. The normalization keeps
// "+" for international prefixes and drops everything else.
export function telHref(value: string | null): string | null {
  if (!value) return null;
  const normalized = value.replace(/[^0-9+]/g, "");
  return normalized.length > 0 ? `tel:${normalized}` : null;
}

export function cardPaymentStatusLabel(
  status: PublicInsurer["cardPaymentStatus"],
): string {
  switch (status) {
    case "available":
      return "\uc0ac\uc6a9 \uac00\ub2a5";
    case "conditional":
      return DIRECTORY_TEXT.conditional;
    case "unavailable":
      return DIRECTORY_TEXT.unavailable;
    case "unknown":
    default:
      return DIRECTORY_TEXT.missing;
  }
}

export type CardPaymentTone = "ok" | "warn" | "muted";

export function cardPaymentTone(
  status: PublicInsurer["cardPaymentStatus"],
): CardPaymentTone {
  if (status === "available") return "ok";
  if (status === "conditional") return "warn";
  return "muted";
}

export function cardPaymentLegLabel(value: boolean | null): string {
  if (value === true) return "\uac00\ub2a5";
  if (value === false) return DIRECTORY_TEXT.unavailable;
  return DIRECTORY_TEXT.missing;
}

export interface ClaimFaxDisplay {
  primary: string;
  secondary: string | null;
  isFallback: boolean;
}

export function claimFaxDisplay(insurer: PublicInsurer): ClaimFaxDisplay {
  switch (insurer.claimFaxHandlingType) {
    case "fax": {
      const number = insurer.claimFaxNumber ?? insurer.faxNumber;
      return number
        ? { primary: number, secondary: null, isFallback: false }
        : { primary: DIRECTORY_TEXT.missing, secondary: null, isFallback: true };
    }
    case "call_center_individual":
      return {
        primary: DIRECTORY_TEXT.callCenterIndividual,
        secondary: insurer.customerCenterPhone ?? insurer.helpdeskPhone,
        isFallback: false,
      };
    case "unavailable":
      return {
        primary: DIRECTORY_TEXT.unavailable,
        secondary: null,
        isFallback: false,
      };
    case "unknown":
    default:
      return {
        primary: DIRECTORY_TEXT.missing,
        secondary: null,
        isFallback: true,
      };
  }
}

export function lastVerifiedLabel(value: string | null): string {
  if (!value) return DIRECTORY_TEXT.missing;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return match ? `${match[1]}.${match[2]}.${match[3]}` : value;
}
