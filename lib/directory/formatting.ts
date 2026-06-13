import type { PublicInsurer } from "@/lib/public/insurers";
import { lastVerifiedLabel as formatLastVerifiedLabel } from "@/lib/public/data-freshness";

// Centralized fallback copy for the public /directory UI. Keep these strings
// in sync with docs/INSURER_ACTION_FIELD_EXPANSION_PLAN.md Section F (data
// governance). Never render raw null, undefined, empty strings, or enum
// identifiers in the public surface.
export const DIRECTORY_TEXT = {
  missing: "준비 중",
  unavailable: "해당사항 없음",
  callCenterIndividual: "콜센터 개별접수",
  conditional: "조건 확인 필요",
} as const;

export const CATEGORY_LABELS: Record<PublicInsurer["category"], string> = {
  life: "생명보험",
  non_life: "손해보험",
};

export function verificationStatusLabel(
  status: PublicInsurer["verificationStatus"],
): string {
  if (status === "verified") return "검수 완료";
  if (status === "needs_review") return "검수 필요";
  return "검수 중";
}

/** Public surface — avoid admin-style verification labels (PR112). */
export function publicContentTrustHint(
  status: PublicInsurer["verificationStatus"],
): string | null {
  if (status === "needs_review") {
    return "공식 확인 진행 중";
  }
  return null;
}

export function publicClaimTrustHint(
  status: PublicInsurer["verificationStatus"],
): string | null {
  if (status === "needs_review") {
    return "공식 확인 진행 중 · 최종 기준은 보험사 안내를 확인하세요";
  }
  return null;
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
      return "사용 가능";
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
  if (value === true) return "가능";
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
  return formatLastVerifiedLabel(value);
}
