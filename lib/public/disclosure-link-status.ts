import { isValidAdminUrl } from "@/lib/validators/disclosure-link";

export type DisclosureLinkRegistrationStatus =
  | "complete"
  | "partial"
  | "registered"
  | "missing";

export type DisclosureLinkStatusResult = {
  status: DisclosureLinkRegistrationStatus;
  label: string;
  description: string;
  hasDisclosureLink: boolean;
  hasTermsLink: boolean;
  hasAnyOfficialLink: boolean;
};

export const DISCLOSURE_LINK_STATUS_COPY = {
  complete: {
    label: "공식 자료 경로 등록",
    description: "열람 전 보험사 공식 홈페이지에서 한 번 더 확인하세요.",
  },
  registered: {
    label: "공식 자료 경로 등록",
    description: "열람 전 보험사 공식 홈페이지에서 한 번 더 확인하세요.",
  },
  partial: {
    label: "일부 자료 경로 등록",
    description: "등록되지 않은 자료는 보험사 공식 홈페이지에서 확인하세요.",
  },
  missing: {
    label: "공식 링크 준비 중",
    description: "현재 공개 자료 경로가 등록되지 않았습니다.",
  },
} as const;

/** Whether a public disclosure URL is registered in PlannerDesk data. */
export function hasRegisteredPublicDisclosureUrl(
  url: string | null | undefined,
): boolean {
  if (url == null) return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  return isValidAdminUrl(trimmed);
}

function buildStatusResult(
  status: DisclosureLinkRegistrationStatus,
  hasDisclosureLink: boolean,
  hasTermsLink: boolean,
): DisclosureLinkStatusResult {
  const copy = DISCLOSURE_LINK_STATUS_COPY[status];
  return {
    status,
    label: copy.label,
    description: copy.description,
    hasDisclosureLink,
    hasTermsLink,
    hasAnyOfficialLink: hasDisclosureLink || hasTermsLink,
  };
}

/**
 * Pairwise registration status when product disclosure and policy terms URLs
 * are tracked separately in source data.
 */
export function resolveDisclosureRegistrationFromPair(input: {
  disclosureUrl?: string | null;
  termsUrl?: string | null;
}): DisclosureLinkStatusResult {
  const hasDisclosureLink = hasRegisteredPublicDisclosureUrl(input.disclosureUrl);
  const hasTermsLink = hasRegisteredPublicDisclosureUrl(input.termsUrl);

  if (hasDisclosureLink && hasTermsLink) {
    return buildStatusResult("complete", true, true);
  }
  if (hasDisclosureLink || hasTermsLink) {
    return buildStatusResult("partial", hasDisclosureLink, hasTermsLink);
  }
  return buildStatusResult("missing", false, false);
}

/**
 * Single-URL public card status. Used by /disclosure-links where each card
 * exposes one official path field after public selector unification.
 */
export function resolvePublicDisclosureLinkStatus(input: {
  url: string | null;
}): DisclosureLinkStatusResult {
  const hasUrl = hasRegisteredPublicDisclosureUrl(input.url);
  if (hasUrl) {
    return buildStatusResult("registered", true, true);
  }
  return buildStatusResult("missing", false, false);
}
