import { VerificationStatus } from "@prisma/client";
import { ADMIN_CONTENT_SAFETY_COPY } from "@/lib/admin/safety-copy";
import {
  PUBLIC_VERIFICATION_STATUSES,
  isInsurerPubliclyVisible,
  isPublicVerificationStatus,
  type InsurerVisibilityFlags,
} from "@/lib/public/insurers";
import { wouldPublishDraft } from "@/lib/public/visibility";

export const ADMIN_VISIBILITY_COPY = {
  ...ADMIN_CONTENT_SAFETY_COPY,
  policySummary:
    "공개 조건: 게시 중이며, 검수 필요 또는 검수 완료 상태인 보험사만 공개 화면에 표시됩니다.",
  draftPublishBlocked:
    "초안 상태의 보험사는 공개할 수 없습니다. 검수 필요 또는 검수 완료 상태로 변경한 뒤 공개해 주세요.",
  insurerNotFound: "보험사 관리 레코드를 찾을 수 없습니다.",
} as const;

export const VERIFICATION_STATUS_LABEL: Record<VerificationStatus, string> = {
  [VerificationStatus.draft]: "초안",
  [VerificationStatus.needs_review]: "검수 필요",
  [VerificationStatus.verified]: "검수 완료",
  [VerificationStatus.unverified]: "검수 이력 없음",
  [VerificationStatus.pending]: "검수 대기",
};

export const PUBLICATION_LABEL = {
  published: "게시 중",
  unpublished: "비게시",
} as const;

export const VISIBILITY_LABEL = {
  visible: "공개 화면 표시",
  hidden: "공개 조건 미충족",
} as const;

export {
  PUBLIC_VERIFICATION_STATUSES,
  isInsurerPubliclyVisible,
  isPublicVerificationStatus,
  wouldPublishDraft,
};

export type { InsurerVisibilityFlags };
