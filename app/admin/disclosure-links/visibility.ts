import {
  DisclosureLinkCategory,
  DisclosureLinkStatus,
  DisclosureLinkTargetType,
} from "@prisma/client";
import { ADMIN_CONTENT_SAFETY_COPY } from "@/lib/admin/safety-copy";

export const ADMIN_DISCLOSURE_COPY = {
  ...ADMIN_CONTENT_SAFETY_COPY,
  policySummary:
    "공개 조건: 게시 중이며, 검수 완료(published) 상태인 링크만 향후 public 화면에 표시됩니다.",
  publishBlocked:
    "공개(게시)는 검수 완료(published) 상태에서만 가능합니다. 초안·검수 필요·보관 상태는 공개할 수 없습니다.",
  notFound: "공시·약관 링크를 찾을 수 없습니다.",
  prohibitedPhraseTitle: "사용이 금지된 표현이 포함되어 있습니다.",
  prohibitedPhraseDetail:
    "지급 확정·보장 단정 표현은 검토 전 제거해 주세요.",
  pageTitle: "공시·약관 링크 관리",
  pageDescription:
    "공식 공시실, 약관, 협회·감독기관 링크를 검수 후 관리합니다. 공식 출처 확인용 링크이며 보험금 지급 판단 도구가 아닙니다.",
  insurerRequired:
    "대상 유형이 보험사일 때 연결 보험사를 선택해 주세요.",
} as const;

export const CATEGORY_LABEL: Record<DisclosureLinkCategory, string> = {
  [DisclosureLinkCategory.product_disclosure]: "상품공시",
  [DisclosureLinkCategory.policy_terms]: "약관",
  [DisclosureLinkCategory.claim_disclosure]: "청구 공시",
  [DisclosureLinkCategory.insurer_notice]: "보험사 안내",
  [DisclosureLinkCategory.insurer_official_materials]: "보험사 공식자료",
  [DisclosureLinkCategory.insurance_association]: "협회 자료",
  [DisclosureLinkCategory.regulator]: "감독기관",
  [DisclosureLinkCategory.claim_compensation_reference]: "청구·보상 참고",
  [DisclosureLinkCategory.education_practice_reference]: "교육·실무 참고",
  [DisclosureLinkCategory.customer_guide]: "고객 안내",
  [DisclosureLinkCategory.other]: "기타",
};

export const TARGET_TYPE_LABEL: Record<DisclosureLinkTargetType, string> = {
  [DisclosureLinkTargetType.insurer]: "보험사",
  [DisclosureLinkTargetType.regulator]: "감독기관",
  [DisclosureLinkTargetType.association]: "협회",
  [DisclosureLinkTargetType.internal]: "내부",
  [DisclosureLinkTargetType.other]: "기타",
};

export const STATUS_LABEL: Record<DisclosureLinkStatus, string> = {
  [DisclosureLinkStatus.draft]: "초안",
  [DisclosureLinkStatus.needs_review]: "검수 필요",
  [DisclosureLinkStatus.published]: "검수 완료",
  [DisclosureLinkStatus.archived]: "보관",
};

export const PUBLICATION_LABEL = {
  published: "게시 중",
  unpublished: "비게시",
} as const;

export const VISIBILITY_LABEL = {
  visible: "public 노출 가능",
  hidden: "public 미노출",
} as const;

export const WRITABLE_STATUSES = [
  DisclosureLinkStatus.draft,
  DisclosureLinkStatus.needs_review,
  DisclosureLinkStatus.published,
  DisclosureLinkStatus.archived,
] as const;

export function isDisclosureLinkPubliclyVisible(flags: {
  isPublished: boolean;
  status: DisclosureLinkStatus;
}): boolean {
  return flags.isPublished && flags.status === DisclosureLinkStatus.published;
}

export function wouldPublishBlocked(flags: {
  isPublished: boolean;
  status: DisclosureLinkStatus;
}): boolean {
  return flags.isPublished && flags.status !== DisclosureLinkStatus.published;
}
