/**
 * PR-134 — Manual link status check standards (ops). No HTTP probing, no DB fields.
 * Aligns with PR-128 public copy and PR-122 freshness routines.
 */

/** Operator manual classification — not stored in DB in PR134-A. */
export const LINK_CHECK_STATUS = [
  "ok",
  "needs_verification",
  "needs_fix",
  "on_hold",
  "unpublished",
  "pending_review",
] as const;

export type LinkCheckStatus = (typeof LINK_CHECK_STATUS)[number];

export const LINK_CHECK_STATUS_LABEL: Record<LinkCheckStatus, string> = {
  ok: "정상",
  needs_verification: "확인 필요",
  needs_fix: "수정 필요",
  on_hold: "보류",
  unpublished: "비공개",
  pending_review: "검수 대기",
};

export const LINK_CHECK_STATUS_ADMIN_HINT: Record<LinkCheckStatus, string> = {
  ok: "공식 출처 또는 운영자 확인 완료 후 public 표시 가능",
  needs_verification: "public 표시 보류 또는 제한 안내 — 정상·최신 단정 금지",
  needs_fix: "별도 데이터 수정 PR — 이번 PR에서 URL 직접 수정 금지",
  on_hold: "출처·접근 권한 불명확 — public 미노출 또는 관리자 확인",
  unpublished: "public 미노출",
  pending_review: "등록 후 검수 전 — public 미노출",
};

export const LINK_CHECK_TYPE = [
  "system",
  "claim_guide",
  "homepage",
  "mobile_app",
  "disclosure",
  "helpdesk",
  "fax",
  "other",
] as const;

export type LinkCheckType = (typeof LINK_CHECK_TYPE)[number];

export const LINK_CHECK_TYPE_LABEL: Record<LinkCheckType, string> = {
  system: "전산 바로가기",
  claim_guide: "청구안내",
  homepage: "홈페이지",
  mobile_app: "모바일/앱",
  disclosure: "공시/약관",
  helpdesk: "헬프데스크",
  fax: "팩스 안내",
  other: "기타 링크",
};

/** Recommended manual cadence (operator doc — not automated). */
export const LINK_CHECK_CADENCE: Record<LinkCheckType, string> = {
  claim_guide: "월 1회",
  system: "월 1회",
  disclosure: "분기 1회",
  homepage: "분기 1회",
  mobile_app: "분기 1회",
  helpdesk: "월 1회",
  fax: "월 1회",
  other: "등록/수정 시마다",
};

export const PUBLIC_LINK_SAFETY_COPY = {
  externalIntent: "공식 안내 페이지로 이동합니다.",
  systemAccess: "접근 권한이 필요한 전산 링크일 수 있습니다.",
  claimGuide: "청구안내를 확인할 수 있는 링크입니다.",
  noPublicLinks: "현재 공개 가능한 링크가 없습니다.",
  sourcePending: "공식 출처 확인 후 공개됩니다.",
  noAutoCheck:
    "링크 최신성은 운영자 수동 점검 기준을 따릅니다. 자동 크롤·대량 요청은 사용하지 않습니다.",
} as const;

export const FORBIDDEN_PUBLIC_LINK_ASSERTIONS = [
  "최신 링크 확정",
  "무조건 여기로",
  "100% 정확",
  "검수 없이 공개",
] as const;

/** Maps disclosure aggregate UI state to operator check hint (public-safe). */
export function publicDisclosureCheckHint(
  state: "available" | "partial" | "missing",
): string | null {
  if (state === "partial") {
    return PUBLIC_LINK_SAFETY_COPY.sourcePending;
  }
  if (state === "missing") {
    return PUBLIC_LINK_SAFETY_COPY.noPublicLinks;
  }
  return null;
}
