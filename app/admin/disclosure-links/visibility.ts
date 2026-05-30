import type { VerificationStatus } from "@/lib/content";
import { ADMIN_CONTENT_SAFETY_COPY } from "@/lib/admin/safety-copy";
import { isDisclosurePubliclyVisibleStatic } from "@/lib/admin/static-disclosure-admin";
import type { DisclosureLinkEntry } from "@/lib/content";

export const ADMIN_DISCLOSURE_COPY = {
  ...ADMIN_CONTENT_SAFETY_COPY,
  policySummary:
    "공식 공시실·보험사 공식 출처 기준으로 링크를 확인하세요. public 화면은 현재 정적 데이터를 사용합니다.",
  pageTitle: "공시·약관 링크 관리",
  pageDescription:
    "공시실·약관·협회 자료 링크의 검수 상태와 출처 확인일을 점검합니다. 저장·일괄 변경은 DisclosureLink DB PR 이후 제공됩니다.",
  notFound: "공시·약관 링크 항목을 찾을 수 없습니다.",
  staticPublicNote:
    "public /disclosure-links 는 lib/content 정적 목록을 표시합니다. DB 전환 시 isPublished·verificationStatus 규칙이 적용됩니다.",
} as const;

export const VERIFICATION_STATUS_LABEL: Record<VerificationStatus, string> = {
  draft: "초안",
  needs_review: "검수 필요",
  verified: "검수 완료",
};

export const PUBLICATION_LABEL = {
  published: "게시 가능(편집)",
  unpublished: "비게시(편집)",
} as const;

export const VISIBILITY_LABEL = {
  visible: "정적 화면 노출",
  hidden: "초안·비게시",
} as const;

export function isDisclosureAdminVisible(entry: DisclosureLinkEntry): boolean {
  return isDisclosurePubliclyVisibleStatic(entry);
}

export function wouldPublishBlockedDisclosure(
  verificationStatus: VerificationStatus,
  targetPublished: boolean,
): boolean {
  return targetPublished && verificationStatus === "draft";
}
