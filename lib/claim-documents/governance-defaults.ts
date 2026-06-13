import type { ClaimDocumentReviewStatus } from "./governance-types";

export const CLAIM_DOCUMENT_GOVERNANCE_PAGE_TITLE = "청구서류 검수 관리";

export const CLAIM_DOCUMENT_GOVERNANCE_PAGE_DESCRIPTION =
  "청구서류 PDF의 공식 URL, 검수일, 노출 여부를 점검하는 관리자용 운영 보드입니다. PDF 파일은 삭제하지 않고 관리 정보만 확인합니다.";

export const CLAIM_DOCUMENT_GOVERNANCE_PRIORITY_SECTION_TITLE =
  "우선 점검 항목";

export const DEFAULT_CLAIM_DOCUMENT_REVIEW_STATUS: ClaimDocumentReviewStatus =
  "unknown";

export const DEFAULT_CLAIM_DOCUMENT_GOVERNANCE_CAUTION =
  "업무 편의를 위해 청구서류 PDF 다운로드를 제공합니다. 실제 제출 전에는 보험사 공식 안내를 함께 확인해 주세요.";

export const CLAIM_DOCUMENT_GOVERNANCE_ADMIN_SCOPE_NOTICE =
  "현재 화면은 검수 정보 확인용입니다. 저장 기능은 후속 PR에서 연결됩니다.";

export const CLAIM_DOCUMENT_GOVERNANCE_EMPTY_FILTER_MESSAGE =
  "조건에 맞는 청구서류가 없습니다. 필터를 다시 확인해 주세요.";

export const CLAIM_DOCUMENT_GOVERNANCE_OFFICIAL_URL_MISSING_LABEL =
  "공식 URL 미등록";

export const CLAIM_DOCUMENT_GOVERNANCE_OFFICIAL_URL_PRESENT_LABEL = "등록";

export const CLAIM_DOCUMENT_GOVERNANCE_LAST_VERIFIED_MISSING_LABEL =
  "검수일 미등록";

export const CLAIM_DOCUMENT_REVIEW_STATUS_LABELS: Record<
  ClaimDocumentReviewStatus,
  string
> = {
  unknown: "미확인",
  verified: "검수 완료",
  needs_review: "재검수 필요",
  outdated: "구버전",
  hidden: "숨김",
};
