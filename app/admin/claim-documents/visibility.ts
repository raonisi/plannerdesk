import { ClaimDocumentCategory, VerificationStatus } from "@prisma/client";
import { ADMIN_CONTENT_SAFETY_COPY } from "@/lib/admin/safety-copy";
import { PUBLIC_VERIFICATION_STATUSES } from "@/lib/public/insurers";
import {
  isPublishedContentPubliclyVisible,
  wouldPublishDraft,
} from "@/lib/public/visibility";

export const ADMIN_CLAIM_DOC_COPY = {
  ...ADMIN_CONTENT_SAFETY_COPY,
  policySummary:
    "공개 조건: 게시 중이며, 검수 필요 또는 검수 완료 상태인 청구서류만 공개 화면에 표시됩니다.",
  draftPublishBlocked:
    "초안 상태의 청구서류는 공개할 수 없습니다. 검수 필요 또는 검수 완료 상태로 변경한 뒤 공개해 주세요.",
  notFound: "청구서류 관리 레코드를 찾을 수 없습니다.",
  duplicateSlug:
    "이미 사용 중인 슬러그입니다. 다른 슬러그를 입력해 주세요.",
  insurerNotFound:
    "선택하신 보험사를 찾을 수 없습니다. 포럼을 새로고침한 뒤 다시 시도해 주세요.",
  prohibitedPhraseTitle:
    "사용이 금지된 표현이 포함되어 있습니다.",
  prohibitedPhraseDetail:
    "근거 없는 지급 약속, 확정 표현, 공포 마케팅 표현은 검토 전 제거해 주세요.",
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

export const CLAIM_DOCUMENT_CATEGORY_LABEL: Record<
  ClaimDocumentCategory,
  string
> = {
  [ClaimDocumentCategory.actual_expense]: "실손",
  [ClaimDocumentCategory.diagnosis]: "진단",
  [ClaimDocumentCategory.surgery]: "수술",
  [ClaimDocumentCategory.hospitalization]: "입원",
  [ClaimDocumentCategory.outpatient]: "통원",
  [ClaimDocumentCategory.fracture]: "골절",
  [ClaimDocumentCategory.driver]: "운전자",
  [ClaimDocumentCategory.death]: "사망",
  [ClaimDocumentCategory.disability]: "후유장해",
  [ClaimDocumentCategory.other]: "기타",
};

export const CLAIM_DOCUMENT_CATEGORY_OPTIONS: {
  value: ClaimDocumentCategory;
  label: string;
}[] = [
  { value: ClaimDocumentCategory.actual_expense, label: "실손" },
  { value: ClaimDocumentCategory.diagnosis, label: "진단" },
  { value: ClaimDocumentCategory.surgery, label: "수술" },
  { value: ClaimDocumentCategory.hospitalization, label: "입원" },
  { value: ClaimDocumentCategory.outpatient, label: "통원" },
  { value: ClaimDocumentCategory.fracture, label: "골절" },
  { value: ClaimDocumentCategory.driver, label: "운전자" },
  { value: ClaimDocumentCategory.death, label: "사망" },
  { value: ClaimDocumentCategory.disability, label: "후유장해" },
  { value: ClaimDocumentCategory.other, label: "기타" },
];

export function isClaimDocumentPubliclyVisible(flags: {
  isPublished: boolean;
  verificationStatus: VerificationStatus;
}): boolean {
  return isPublishedContentPubliclyVisible(flags);
}

export { PUBLIC_VERIFICATION_STATUSES, wouldPublishDraft };
