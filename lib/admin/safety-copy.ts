/**
 * Shared admin safety and governance copy for content CRUD surfaces.
 * Wording follows PR-ADMIN-01 operator guidelines — no payout guarantees,
 * no PII/medical record collection, official-source verification required.
 */
export const ADMIN_CONTENT_SAFETY_COPY = {
  governanceRule:
    "공개 전 공식 출처와 최신 기준을 확인하세요.",
  draftRule:
    "작성 중 상태의 데이터는 공개 화면에 노출되지 않습니다.",
  needsReviewRule:
    "검수 대기 상태의 문서는 공개되더라도 공식 확인 진행 중 안내와 함께 표시됩니다.",
  sensitiveNotice:
    "고객 개인정보, 의료자료, 진단서, 처방전, 청구서류 원본은 입력하지 마세요.",
  guidanceNotice:
    "PlannerDesk는 보험금 지급 여부와 지급 금액을 판단하지 않습니다.",
  referenceNotice:
    "본 자료는 설계사 실무 참고용입니다. 보험사별 기준 확인이 필요합니다.",
} as const;

export const ADMIN_UNAUTHORIZED_MESSAGE =
  "관리자 권한이 필요합니다. 승인된 운영자 계정으로 다시 로그인해 주세요.";
