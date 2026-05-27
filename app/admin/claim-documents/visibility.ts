import { ClaimDocumentCategory, VerificationStatus } from "@prisma/client";
import { PUBLIC_VERIFICATION_STATUSES } from "@/lib/public/insurers";

// Korean copy for the admin-side ClaimDocument workflow. These strings stay
// consistent with the canonical visibility rule exported from
// `lib/public/insurers.ts` (the same rule applies to ClaimDocument records;
// the future PR-39 public read will import that rule directly).
//
// Two notices in this object are MANDATED by the PR-38 task specification
// and must be surfaced verbatim on both the list and form pages:
//   - guidanceNotice  (no payout / coverage / amount judgment)
//   - sensitiveNotice (no PII, no policy numbers, no medical records, no
//     claim documents, no customer-specific medical info)
export const ADMIN_CLAIM_DOC_COPY = {
  policySummary:
    "공개 조건: 게시 중이며, 검수 필요 또는 검수 완료 상태인 청구서류만 공개 화면에 표시됩니다.",
  draftRule:
    "초안 상태는 게시 여부와 관계없이 공개 화면에 표시되지 않습니다.",
  governanceRule:
    "공개 전 반드시 보험사 공식 약관·공식 청구 안내 자료를 확인해 주세요.",
  draftPublishBlocked:
    "초안 상태의 청구서류는 공개할 수 없습니다. 검수 필요 또는 검수 완료 상태로 변경한 뒤 공개해 주세요.",
  notFound: "청구서류 관리 레코드를 찾을 수 없습니다.",
  duplicateSlug:
    "이미 사용 중인 슬러그입니다. 다른 슬러그를 입력해 주세요.",
  insurerNotFound:
    "선택하신 보험사를 찾을 수 없습니다. 포럼을 새로고침한 뒤 다시 시도해 주세요.",

  // Verbatim notices required by the PR-38 task specification.
  guidanceNotice:
    "청구서류 안내는 보험금 지급 여부나 지급 금액을 판단하는 내용이 아닙니다. 공식 약관과 보험사 기준 확인 후 공개해 주세요.",
  sensitiveNotice:
    "주민등록번호, 증권번호, 진료기록, 보험금 청구서류, 고객별 의료정보는 입력하거나 저장하지 마세요.",

  prohibitedPhraseTitle:
    "사용이 금지된 표현이 포함되어 있습니다.",
  prohibitedPhraseDetail:
    "근거 없는 지급 약속, 확정 표현, 공포 마케팅 표현은 검토 전 제거해 주세요.",
} as const;

// The admin form for ClaimDocument only exposes the operational verification
// states. The remaining VerificationStatus enum values exist on the shared
// enum because of the User model; the labels below stay exhaustive so
// TypeScript can guarantee a label for every enum value.
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

// Korean labels for the closed enum shipped in PR-37. The PR-36 plan used
// "indemnity" as the working title for 실손; the enum value lands as
// `actual_expense` in PR-37 but the operator label remains 실손.
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

// The category options offered in the admin form. Order roughly mirrors the
// PR-36 §E sequence so operators see related categories near each other.
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

// Same forbidden combination as Insurer: a draft record must never publish.
// The server enforces this in every write path; the UI uses the same check
// to disable affordances early.
export function wouldPublishDraft(flags: {
  isPublished: boolean;
  verificationStatus: VerificationStatus;
}): boolean {
  return (
    flags.isPublished && flags.verificationStatus === VerificationStatus.draft
  );
}

// PR-39 public read will import the canonical rule from
// `lib/public/insurers.ts` so the visibility predicate cannot drift across
// content hubs. This helper is used only for admin UI badges.
export function isClaimDocumentPubliclyVisible(flags: {
  isPublished: boolean;
  verificationStatus: VerificationStatus;
}): boolean {
  return (
    flags.isPublished &&
    (PUBLIC_VERIFICATION_STATUSES as readonly VerificationStatus[]).includes(
      flags.verificationStatus,
    )
  );
}
