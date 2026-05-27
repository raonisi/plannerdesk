import { VerificationStatus } from "@prisma/client";
import {
  PUBLIC_VERIFICATION_STATUSES,
  isInsurerPubliclyVisible,
  isPublicVerificationStatus,
  type InsurerVisibilityFlags,
} from "@/lib/public/insurers";

// Korean copy for the admin-side verification/publish workflow. These strings
// must stay consistent with the canonical visibility rule exported from
// `lib/public/insurers.ts`. The rule is documented in
// docs/INSURER_ACTION_FIELD_EXPANSION_PLAN.md (Public visibility policy).
export const ADMIN_VISIBILITY_COPY = {
  policySummary:
    "공개 조건: 게시 중이며, 검수 필요 또는 검수 완료 상태인 보험사만 공개 화면에 표시됩니다.",
  draftRule:
    "초안 상태는 게시 여부와 관계없이 공개 화면에 표시되지 않습니다.",
  governanceRule:
    "검수 완료 전 정보는 공개 전 공식 출처 확인이 필요합니다.",
  draftPublishBlocked:
    "초안 상태의 보험사는 공개할 수 없습니다. 검수 필요 또는 검수 완료 상태로 변경한 뒤 공개해 주세요.",
  insurerNotFound: "보험사 관리 레코드를 찾을 수 없습니다.",
} as const;

// The Insurer admin UI only offers draft / needs_review / verified because
// those are the operational states for editorial content. The remaining enum
// values (`unverified`, `pending`) exist on the shared VerificationStatus enum
// for the User model and are surfaced here only to keep the label exhaustive.
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

// True when the next save/publish would land in the forbidden state of
// isPublished=true + verificationStatus=draft. The server enforces this in
// every write path; the UI uses the same check to disable affordances early.
export function wouldPublishDraft(flags: InsurerVisibilityFlags): boolean {
  return flags.isPublished && flags.verificationStatus === VerificationStatus.draft;
}

export {
  PUBLIC_VERIFICATION_STATUSES,
  isInsurerPubliclyVisible,
  isPublicVerificationStatus,
};
