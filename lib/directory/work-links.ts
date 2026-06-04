// Public work-link types, grouping labels, and copy (PR-128). No visibility rule changes.

import type { PublicInsurer } from "@/lib/public/insurers";
import type { InsurerDisclosureLinks } from "@/lib/content/disclosure-match";
import { DIRECTORY_TEXT } from "@/lib/directory/formatting";

/** Purpose groups shown on the insurer directory card. */
export const WORK_LINK_GROUP_LABELS = {
  claim: "청구 업무",
  system: "전산 업무",
  official: "공식 정보",
  support: "지원·문의",
} as const;

export type WorkLinkGroupKey = keyof typeof WORK_LINK_GROUP_LABELS;

/** Link purpose labels — action-oriented, no accuracy guarantees. */
export const WORK_LINK_ACTION_LABELS = {
  claimGuide: "청구안내 보기",
  claimDocuments: "필요서류 확인",
  system: "전산 바로가기",
  plannerPortal: "설계사 포털",
  homepage: "공식 홈페이지",
  terms: "약관 확인",
  productDisclosure: "공시실 확인",
  policyTerms: "통합약관 확인",
  disclosureHub: "공시·약관 허브",
  helpdesk: "헬프데스크 전화",
  customerCenter: "고객센터 전화",
  claimForm: "청구양식 열기",
} as const;

export const WORK_LINK_COPY = {
  missing: DIRECTORY_TEXT.missing,
  systemAccessNote:
    "로그인 또는 접근 권한이 필요할 수 있습니다. 공식 안내를 먼저 확인하세요.",
  needsReviewNote:
    "공식 출처 확인이 진행 중입니다. 최종 기준은 보험사 안내를 확인하세요.",
  disclosureUnverified:
    "공식 공시 경로 확인 후 업데이트됩니다.",
  /** PR-134 — neutral external link intent (not a freshness guarantee). */
  externalOpenHint: "공식 안내 페이지로 이동합니다.",
} as const;

const LOGIN_PATH_PATTERN = /\/login|signin|sign-in|\/auth|sso|#\/login/i;

/** Neutral hint when a URL likely requires planner credentials. */
export function plannerSystemAccessNote(url: string | null): string | null {
  if (!url?.trim()) return null;
  try {
    const parsed = new URL(url);
    const target = `${parsed.pathname}${parsed.hash}`;
    if (LOGIN_PATH_PATTERN.test(target)) {
      return WORK_LINK_COPY.systemAccessNote;
    }
  } catch {
    if (LOGIN_PATH_PATTERN.test(url)) {
      return WORK_LINK_COPY.systemAccessNote;
    }
  }
  return null;
}

export function resolveSystemLinks(insurer: PublicInsurer): {
  primary: string | null;
  secondary: string | null;
  primaryLabel: string;
  secondaryLabel: string;
} {
  const primary = insurer.systemUrl ?? insurer.plannerPortalUrl;
  const secondary =
    insurer.systemUrl &&
    insurer.plannerPortalUrl &&
    insurer.plannerPortalUrl !== insurer.systemUrl
      ? insurer.plannerPortalUrl
      : null;

  return {
    primary,
    secondary,
    primaryLabel: insurer.systemUrl
      ? WORK_LINK_ACTION_LABELS.system
      : WORK_LINK_ACTION_LABELS.plannerPortal,
    secondaryLabel: WORK_LINK_ACTION_LABELS.plannerPortal,
  };
}

export function disclosureLinkStatus(
  links: InsurerDisclosureLinks,
): "available" | "partial" | "missing" {
  const count = [
    links.productDisclosure?.sourceUrl,
    links.policyTerms?.sourceUrl,
  ].filter(Boolean).length;
  if (count === 0) return "missing";
  if (count === 2) return "available";
  return "partial";
}
